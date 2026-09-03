"use client";

import { useMemo, type ReactElement } from "react";
import type { SpeciesKey } from "@/lib/species";

/**
 * Generative bouquet illustration for the composer's live preview.
 *
 * Renders a hand-tied bouquet as a technical/botanical schematic: stems
 * gather at a single binding point and fan upward to flower heads laid out
 * with a Fibonacci (golden-angle) phyllotaxis packing, the same construction
 * real sunflower-seed/round-bouquet head arrangements follow — see
 * "Polar Petals" (jwilson.coe.uga.edu) and the classic Vogel spiral model for
 * the packing math, and hand-tied bouquet tutorials (e.g. The Suffolk Nest,
 * Floral Design Institute) for the spiral-to-single-binding-point structure
 * this stem layout mirrors. The six cabinet species share three bloom
 * geometries in pairs (rounded/layered, clustered floret, radiating petal
 * with a contrast center) and are told apart within each pair by color from
 * the site's existing palette tokens only — no new hues, no realistic detail.
 */

const VIEW_W = 320;
const VIEW_H = 408;
const BIND_X = VIEW_W / 2;
const BIND_Y = 358;
const DOME_X = VIEW_W / 2;
const DOME_Y = 176;
const GOLDEN_ANGLE = 137.50776;
const SPACING = 16.5;

type HeadPos = { x: number; y: number; r: number; angle: number };

function layoutHeads(stemCount: number): HeadPos[] {
  const headRadius = Math.max(13, 28 - stemCount * 0.68);
  const heads: HeadPos[] = [];
  for (let i = 0; i < stemCount; i += 1) {
    const radius = SPACING * Math.sqrt(i + 0.5);
    const angle = i * GOLDEN_ANGLE;
    const rad = (angle * Math.PI) / 180;
    heads.push({
      x: DOME_X + radius * Math.cos(rad) * 1.22,
      y: DOME_Y + radius * Math.sin(rad) * 0.6,
      r: headRadius,
      angle,
    });
  }
  return heads;
}

function stemPath(head: HeadPos): string {
  const waistY = BIND_Y - 46;
  const controlX = BIND_X + (head.x - BIND_X) * 0.22;
  return `M ${BIND_X} ${BIND_Y} Q ${controlX} ${waistY} ${head.x} ${head.y}`;
}

function RoundedBloomHead({ x, y, r, petalFill, coreFill }: HeadPos & { petalFill: string; coreFill: string }) {
  const petals = 7;
  return (
    <g className="bloom bloom-rounded">
      {Array.from({ length: petals }).map((_, i) => {
        const angle = (360 / petals) * i;
        return (
          <circle
            key={i}
            className="bloom-petal"
            cx={x}
            cy={y}
            r={r * 0.56}
            transform={`rotate(${angle} ${x} ${y}) translate(0 ${-r * 0.34})`}
            fill={petalFill}
            stroke="var(--encre)"
            strokeWidth={0.6}
          />
        );
      })}
      <circle className="bloom-core" cx={x} cy={y} r={r * 0.42} fill={coreFill} stroke="var(--encre)" strokeWidth={0.6} />
    </g>
  );
}

function floretPath(size: number): string {
  const s = size;
  return `M 0 ${-s} Q ${s} ${-s} ${s} 0 Q ${s} ${s} 0 ${s} Q ${-s} ${s} ${-s} 0 Q ${-s} ${-s} 0 ${-s} Z`;
}

function ClusterBloomHead({ x, y, r, colorA, colorB }: HeadPos & { colorA: string; colorB: string }) {
  const florets = 5;
  return (
    <g className="bloom bloom-cluster">
      {Array.from({ length: florets }).map((_, i) => {
        const radius = i === 0 ? 0 : r * 0.5;
        const angle = i === 0 ? 0 : (360 / (florets - 1)) * (i - 1) + 20;
        const fx = x + radius * Math.cos((angle * Math.PI) / 180);
        const fy = y + radius * Math.sin((angle * Math.PI) / 180);
        const size = i === 0 ? r * 0.4 : r * 0.34;
        return (
          <path
            key={i}
            className="bloom-petal"
            d={floretPath(size)}
            transform={`translate(${fx} ${fy})`}
            fill={i % 2 === 0 ? colorA : colorB}
            stroke="var(--encre)"
            strokeWidth={0.5}
          />
        );
      })}
    </g>
  );
}

function RadiatingBloomHead({ x, y, r, petalFill, coreFill }: HeadPos & { petalFill: string; coreFill: string }) {
  const petals = 7;
  return (
    <g className="bloom bloom-radiating">
      {Array.from({ length: petals }).map((_, i) => {
        const angle = (360 / petals) * i;
        return (
          <ellipse
            key={i}
            className="bloom-petal"
            cx={0}
            cy={-r * 0.52}
            rx={r * 0.3}
            ry={r * 0.46}
            transform={`translate(${x} ${y}) rotate(${angle})`}
            fill={petalFill}
            stroke="var(--encre)"
            strokeWidth={0.6}
          />
        );
      })}
      <circle className="bloom-core" cx={x} cy={y} r={r * 0.3} fill={coreFill} />
    </g>
  );
}

const HEAD_RENDERERS: Record<SpeciesKey, (head: HeadPos, key: number) => ReactElement> = {
  pivoine: (head, key) => <RoundedBloomHead key={key} {...head} petalFill="var(--poudre)" coreFill="var(--poudre-deep)" />,
  rose: (head, key) => <RoundedBloomHead key={key} {...head} petalFill="var(--poudre-deep)" coreFill="var(--encre-soft)" />,
  hortensia: (head, key) => <ClusterBloomHead key={key} {...head} colorA="var(--ciel)" colorB="var(--ciel-deep)" />,
  cosmos: (head, key) => <ClusterBloomHead key={key} {...head} colorA="var(--poudre)" colorB="var(--poudre-deep)" />,
  anemone: (head, key) => <RadiatingBloomHead key={key} {...head} petalFill="var(--papier-deep)" coreFill="var(--encre)" />,
  iris: (head, key) => <RadiatingBloomHead key={key} {...head} petalFill="var(--ciel-deep)" coreFill="var(--encre)" />,
};

const SPECIES_ORDER: SpeciesKey[] = ["pivoine", "rose", "hortensia", "cosmos", "anemone", "iris"];

export function BouquetSketch({
  species,
  stemCount,
  luxuryWrap,
}: {
  species: SpeciesKey;
  stemCount: number;
  luxuryWrap: boolean;
}) {
  const heads = useMemo(() => layoutHeads(stemCount), [stemCount]);

  return (
    <svg
      className="bouquet-sketch"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label={`Croquis d'un bouquet de ${stemCount} tiges, dominante ${species}`}
    >
      <g className="bouquet-stems">
        {heads.map((head, i) => (
          <path key={i} className="stem-line" d={stemPath(head)} fill="none" stroke="var(--encre-soft)" strokeWidth={1} />
        ))}
      </g>

      <g className={luxuryWrap ? "bouquet-wrap is-visible" : "bouquet-wrap"}>
        {(() => {
          const topY = BIND_Y - 74;
          const apexY = BIND_Y + 16;
          const halfTop = 34;
          const bandY1 = topY + (apexY - topY) * 0.36;
          const bandY2 = topY + (apexY - topY) * 0.5;
          const halfW1 = halfTop * (1 - 0.36);
          const halfW2 = halfTop * (1 - 0.5);
          const bowY = (bandY1 + bandY2) / 2;
          return (
            <>
              <path
                className="wrap-cone"
                d={`M ${BIND_X - halfTop} ${topY} Q ${BIND_X - 10} ${(topY + apexY) / 2} ${BIND_X} ${apexY} Q ${BIND_X + 10} ${(topY + apexY) / 2} ${BIND_X + halfTop} ${topY} Q ${BIND_X} ${topY - 7} ${BIND_X - halfTop} ${topY} Z`}
                fill="var(--papier-deep)"
                stroke="var(--encre)"
                strokeWidth={1}
              />
              <path
                className="wrap-ribbon"
                d={`M ${BIND_X - halfW1} ${bandY1} L ${BIND_X + halfW1} ${bandY1} L ${BIND_X + halfW2} ${bandY2} L ${BIND_X - halfW2} ${bandY2} Z`}
                fill="var(--encre)"
              />
              <path className="wrap-bow" d={`M ${BIND_X} ${bowY} L ${BIND_X - 15} ${bowY - 9} L ${BIND_X - 15} ${bowY + 3} Z`} fill="var(--encre)" />
              <path className="wrap-bow" d={`M ${BIND_X} ${bowY} L ${BIND_X + 15} ${bowY - 9} L ${BIND_X + 15} ${bowY + 3} Z`} fill="var(--encre)" />
              <circle cx={BIND_X} cy={bowY} r={3} fill="var(--papier-deep)" stroke="var(--encre)" strokeWidth={1} />
            </>
          );
        })()}
      </g>

      {SPECIES_ORDER.map((option) => (
        <g key={option} className={option === species ? "bloom-layer is-active" : "bloom-layer"}>
          {heads.map((head, i) => HEAD_RENDERERS[option](head, i))}
        </g>
      ))}

      <circle className="bind-point" cx={BIND_X} cy={BIND_Y} r={2.4} fill="var(--encre)" />
    </svg>
  );
}
