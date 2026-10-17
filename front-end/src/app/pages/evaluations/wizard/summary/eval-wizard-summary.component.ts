import {ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, input, linkedSignal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {EvalDetail} from '../../../../models/eval-detail.model';
import {Archetype, Endurance, StrengthSpeed, Technique} from '../../../../models/archetype.model';
import {PsychoStrength, PsychoWeakness} from '../../../../models/evaluation.model';
import {EvalSummary, MUSCULATION_FLAGS, MusculationKey, ProtocolGoal} from '../../../../models/eval-summary.model';
import {TechniqueGap} from '../eval-wizard-step';
import {resolveArchetype} from './archetype-combinations';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';

/** Vrai si l'exercice est un mouvement de tirage (exclu de certains calculs). */
function isPull(code: string): boolean {
  return code.includes('.pull.');
}

/** Somme des résultats (-1/0/1) d'une liste, en ignorant les lignes sans result. */
function sumResults(rows: readonly EvalDetail[], keep: (row: EvalDetail) => boolean = () => true): number {
  return rows.reduce((sum, row) => (row.result != null && keep(row) ? sum + row.result : sum), 0);
}

/** Nombre de bits à 1 d'un entier (popcount). */
function popcount(value: number): number {
  let count = 0;
  for (let v = value; v > 0; v >>= 1) {
    count += v & 1;
  }
  return count;
}

/** Code de la variante mesurée au plus grand écart (force), ou null si aucune mesurée. */
function strongest(options: readonly TechniqueGap[]): string | null {
  const measured = options.filter((o) => o.gap != null);
  if (measured.length === 0) return null;
  return measured.reduce((best, o) => (o.gap! > best.gap! ? o : best)).code;
}

/** Code de la variante mesurée au plus petit écart (faiblesse), ou null si aucune mesurée. */
function weakest(options: readonly TechniqueGap[]): string | null {
  const measured = options.filter((o) => o.gap != null);
  if (measured.length === 0) return null;
  return measured.reduce((worst, o) => (o.gap! < worst.gap! ? o : worst)).code;
}

/**
 * Étape finale du wizard d'évaluation : Synthèse / Validation.
 *
 * Contrairement aux autres étapes, elle n'implémente pas `EvalWizardStep`
 * (dont la valeur est un `EvalDetail[]`) : elle produit un {@link EvalSummary}
 * (miroir de `eval_summaries`), exposé via {@link summary}. Elle reçoit en
 * entrée les résultats agrégés des étapes précédentes et en dérive des
 * présélections.
 *
 * Chaque champ éditable est un {@link linkedSignal} : il **recalcule** sa
 * présélection quand les résultats d'entrée changent, tout en **conservant** un
 * choix manuel du coach jusqu'au prochain changement de source. L'archétype est
 * lié aux trois profils courants : il se recalcule dès qu'un profil change
 * (présélection automatique ou modification manuelle), tout en restant
 * surchargeable.
 */
@Component({
  selector: 'app-eval-wizard-summary',
  standalone: true,
  imports: [TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './eval-wizard-summary.component.html'
})
export class EvalWizardSummaryComponent {

  // --- Entrées : résultats agrégés des étapes précédentes ---
  readonly speed = input<readonly EvalDetail[]>([]);          // étape 1
  readonly strength = input<readonly EvalDetail[]>([]);       // étape 2
  readonly snatch = input<readonly EvalDetail[]>([]);         // étape 3
  readonly clean = input<readonly EvalDetail[]>([]);          // étape 4
  readonly jerk = input<readonly EvalDetail[]>([]);           // étape 5
  readonly squatStep = input<readonly EvalDetail[]>([]);      // étape 6
  readonly competition = input<readonly EvalDetail[]>([]);    // étape 7
  readonly enduranceStep = input<readonly EvalDetail[]>([]);  // étape 8
  /** Résultats des 7 blocs psycho (étapes 9-15), dans l'ordre des blocs. */
  readonly psycho = input<readonly (readonly EvalDetail[])[]>([]);

  // --- Entrées : écarts réalisé / attendu des étapes techniques ---
  readonly snatchGaps = input<readonly TechniqueGap[]>([]);  // étape 3
  readonly cleanGaps = input<readonly TechniqueGap[]>([]);   // étape 4
  readonly jerkGaps = input<readonly TechniqueGap[]>([]);    // étape 5

  // --- Options des listes déroulantes (valeurs d'enum alignées BD) ---
  protected readonly strengthSpeedOptions: readonly StrengthSpeed[] = ['STRENGTH', 'MID', 'SPEED'];
  protected readonly techniqueOptions: readonly Technique[] = ['LOW', 'MID', 'HIGH'];
  protected readonly enduranceOptions: readonly Endurance[] = ['LOW', 'MID', 'HIGH'];
  protected readonly archetypeOptions: readonly Archetype[] = ['MID', 'ROUGH', 'TECH', 'CYCLE', 'LEARN'];
  protected readonly protocolOptions: readonly ProtocolGoal[] = ['STRENGTH', 'MID', 'SPEED'];
  protected readonly psychoStrengthOptions: readonly PsychoStrength[] =
    ['CALM', 'CONFIDENT', 'MOTIVATED', 'FOCUSED', 'COMPETITIVE', 'CHALLENGER', 'INDEPENDANT'];
  protected readonly psychoWeaknessOptions: readonly PsychoWeakness[] =
    ['EMOTIONAL', 'ANXIOUS', 'INDIFFERENT', 'DISTRACTED', 'HEDONISTIC', 'PRAGMATIC', 'RULE'];
  protected readonly musculationOptions: readonly MusculationKey[] =
    ['GENERAL', 'LEGS', 'POSTERIOR_CHAIN', 'UPPER_BODY'];

  // ===== Bloc 1 : Profil & Archétype =====

  /** Présélection force-vitesse : Σ(vitesse) − Σ(force). */
  readonly strengthSpeedValue = linkedSignal<StrengthSpeed>(() => {
    const score = sumResults(this.speed()) - sumResults(this.strength());
    if (score < -2) return 'STRENGTH';
    if (score > 2) return 'SPEED';
    return 'MID';
  });

  /** Présélection technique : Σ(étapes 3,4,5,7 hors tirage). */
  readonly techniqueValue = linkedSignal<Technique>(() => {
    const notPull = (r: EvalDetail) => !isPull(r.exerciceCode);
    const score =
      sumResults(this.snatch(), notPull) +
      sumResults(this.clean(), notPull) +
      sumResults(this.jerk(), notPull) +
      sumResults(this.competition(), notPull);
    if (score < -5) return 'LOW';
    if (score > 5) return 'HIGH';
    return 'MID';
  });

  /** Présélection endurance : Σ(étape 8). */
  readonly enduranceValue = linkedSignal<Endurance>(() => {
    const score = sumResults(this.enduranceStep());
    if (score < -3) return 'LOW';
    if (score > 3) return 'HIGH';
    return 'MID';
  });

  /**
   * Archétype lié aux 3 profils : se recalcule à chaque changement d'un profil
   * (présélection ou choix manuel), tout en restant surchargeable par le coach.
   */
  readonly archetypeValue = linkedSignal<Archetype | null>(() =>
    resolveArchetype(this.strengthSpeedValue(), this.techniqueValue(), this.enduranceValue())
  );

  // ===== Bloc 2 : Technique (force / faiblesse par mouvement) =====

  protected snatchOptions = computed(() => this.snatchGaps().map(e => e.code));
  protected cleanOptions = computed(() => this.cleanGaps().map(e => e.code));
  protected jerkOptions = computed(() => this.jerkGaps().map(e => e.code));

  readonly snatchStrengthValue = linkedSignal<string | null>(() => strongest(this.snatchGaps()));
  readonly snatchWeaknessValue = linkedSignal<string | null>(() => weakest(this.snatchGaps()));
  readonly cleanStrengthValue = linkedSignal<string | null>(() => strongest(this.cleanGaps()));
  readonly cleanWeaknessValue = linkedSignal<string | null>(() => weakest(this.cleanGaps()));
  readonly jerkStrengthValue = linkedSignal<string | null>(() => strongest(this.jerkGaps()));
  readonly jerkWeaknessValue = linkedSignal<string | null>(() => weakest(this.jerkGaps()));

  // ===== Bloc 3 : squat / tirage / musculation =====

  /** Squat : <-2 Force ; sinon si Σ6>-2 ET Σ(vitesse hors tirage haut)<0 Vitesse ; sinon Maintien. */
  readonly squatValue = linkedSignal<ProtocolGoal>(() => {
    const squatSum = sumResults(this.squatStep());
    if (squatSum < -2) return 'STRENGTH';
    const speedNoHighPull = sumResults(this.speed(), (r) => r.exerciceCode !== 'eval.strength.speed.high-pull-80');
    if (squatSum > -2 && speedNoHighPull < 0) return 'SPEED';
    return 'MID';
  });

  /** Tirage : <-2 Force ; sinon si Σpull>-2 ET vitesse(tirage haut)<0 Vitesse ; sinon Maintien. */
  readonly pullValue = linkedSignal<ProtocolGoal>(() => {
    const pullSum = sumResults(this.snatch(), (r) => isPull(r.exerciceCode)) +
      sumResults(this.clean(), (r) => isPull(r.exerciceCode));
    if (pullSum < -2) return 'STRENGTH';
    const highPull = this.speed().find((r) => r.exerciceCode === 'eval.strength.speed.high-pull-80');
    const highPullResult = highPull?.result ?? 0;
    if (pullSum > -2 && highPullResult < 0) return 'SPEED';
    return 'MID';
  });

  /**
   * Musculation (bitmask), liée au squat / tirage courants et aux références :
   * Général toujours ; Jambes si Squat=Force ; Chaîne post. si Tirage=Force ;
   * Haut du corps si jeté de référence < épaulé de référence.
   */
  readonly musculationValue = linkedSignal<number>(() => {
    let mask = MUSCULATION_FLAGS.GENERAL;
    if (this.squatValue() === 'STRENGTH') mask |= MUSCULATION_FLAGS.LEGS;
    if (this.pullValue() === 'STRENGTH') mask |= MUSCULATION_FLAGS.POSTERIOR_CHAIN;
    const jerkRef = this.jerk()[0]?.realValue ?? null;
    const cleanRef = this.clean()[0]?.realValue ?? null;
    if (jerkRef != null && cleanRef != null && jerkRef < cleanRef) {
      mask |= MUSCULATION_FLAGS.UPPER_BODY;
    }
    return mask;
  });

  // ===== Bloc 4 : psychologique =====

  /** Popcount (nombre de cases cochées) de chaque bloc psycho. */
  private readonly psychoCounts = computed<number[]>(() =>
    this.psycho().map((block) => popcount(block[0]?.realValue ?? 0))
  );

  /** Point fort psycho : bloc le plus coché (premier en cas d'ex æquo). */
  readonly psychoStrengthValue = linkedSignal<PsychoStrength | null>(() => {
    const counts = this.psychoCounts();
    if (counts.length === 0) return null;
    let best = 0;
    for (let i = 1; i < counts.length; i++) {
      if (counts[i] > counts[best]) best = i;
    }
    return this.psychoStrengthOptions[best] ?? null;
  });

  /** Point faible psycho : bloc le moins coché (premier en cas d'ex æquo). */
  readonly psychoWeaknessValue = linkedSignal<PsychoWeakness | null>(() => {
    const counts = this.psychoCounts();
    if (counts.length === 0) return null;
    let worst = 0;
    for (let i = 1; i < counts.length; i++) {
      if (counts[i] < counts[worst]) worst = i;
    }
    return this.psychoWeaknessOptions[worst] ?? null;
  });

  // ===== Bilan complet =====

  /** Bilan exposé au parent (miroir `eval_summaries`). */
  readonly summary = computed<EvalSummary>(() => ({
    strengthSpeed: this.strengthSpeedValue(),
    technique: this.techniqueValue(),
    endurance: this.enduranceValue(),
    archetype: this.archetypeValue(),
    squat: this.squatValue(),
    pull: this.pullValue(),
    musculation: this.musculationValue(),
    snatchStrength: this.snatchStrengthValue(),
    snatchWeakness: this.snatchWeaknessValue(),
    cleanStrength: this.cleanStrengthValue(),
    cleanWeakness: this.cleanWeaknessValue(),
    jerkStrength: this.jerkStrengthValue(),
    jerkWeakness: this.jerkWeaknessValue(),
    psychoStrength: this.psychoStrengthValue(),
    psychoWeakness: this.psychoWeaknessValue()
  }));

  /** Clés de musculation cochées (dérivé du bitmask), pour `[value]` du multiselect. */
  protected readonly musculationSelected = computed<string[]>(() =>
    this.musculationOptions.filter((key) => (this.musculationValue() & MUSCULATION_FLAGS[key]) !== 0)
  );

  // --- Handlers des listes déroulantes (sélection simple) ---
  protected onStrengthSpeed(event: Event): void {
    this.strengthSpeedValue.set((event.target as HTMLInputElement).value as StrengthSpeed);
  }
  protected onTechnique(event: Event): void {
    this.techniqueValue.set((event.target as HTMLInputElement).value as Technique);
  }
  protected onEndurance(event: Event): void {
    this.enduranceValue.set((event.target as HTMLInputElement).value as Endurance);
  }
  protected onArchetype(event: Event): void {
    this.archetypeValue.set((event.target as HTMLInputElement).value as Archetype);
  }
  protected onSquat(event: Event): void {
    this.squatValue.set((event.target as HTMLInputElement).value as ProtocolGoal);
  }
  protected onPull(event: Event): void {
    this.pullValue.set((event.target as HTMLInputElement).value as ProtocolGoal);
  }
  protected onPsychoStrength(event: Event): void {
    this.psychoStrengthValue.set((event.target as HTMLInputElement).value as PsychoStrength);
  }
  protected onPsychoWeakness(event: Event): void {
    this.psychoWeaknessValue.set((event.target as HTMLInputElement).value as PsychoWeakness);
  }
  protected onTechniquePick(
    field: 'snatchStrength' | 'snatchWeakness' | 'cleanStrength' | 'cleanWeakness' | 'jerkStrength' | 'jerkWeakness',
    event: Event
  ): void {
    const value = (event.target as HTMLInputElement).value || null;
    const map = {
      snatchStrength: this.snatchStrengthValue,
      snatchWeakness: this.snatchWeaknessValue,
      cleanStrength: this.cleanStrengthValue,
      cleanWeakness: this.cleanWeaknessValue,
      jerkStrength: this.jerkStrengthValue,
      jerkWeakness: this.jerkWeaknessValue
    };
    map[field].set(value);
  }

  /** Sélection multiple musculation : recompose le bitmask depuis les clés cochées. */
  protected onMusculation(event: Event): void {
    const raw = (event.target as { value?: string | string[] }).value;
    const keys = Array.isArray(raw) ? raw : raw ? [raw] : [];
    const mask = keys.reduce((acc, key) => acc | (MUSCULATION_FLAGS[key as MusculationKey] ?? 0), 0);
    this.musculationValue.set(mask);
  }
}
