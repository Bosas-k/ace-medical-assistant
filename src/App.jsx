import React from "react";
import { Analytics } from '@vercel/analytics/react';
import aceLogo from "./assets/ace-logo.png";

export default function AceMedicalAssistant() {
  const { useMemo, useState } = React;

  const [page, setPage] = useState("treatment");
  const [form, setForm] = useState({
    bleeding: "yes",
    conscious: "no",
    heartRate: "normal",
    respiratoryRate: "normal",
    spO2: "stable",
    chestWound: "no",
    tensionPTX: "no",
    airwayOccluded: "no",
    hemorrhage: "class1",
    limbWounds: "no",
    otherInjuries: "no",
    morphineInSystem: "no",
    overdoseDrug: "none",
  });

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const analysis = useMemo(() => analyzePatient(form), [form]);

  return (
    <div className="min-h-screen bg-[#111318] text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-4">
        <div className="mb-4 border border-zinc-800 bg-[#171a21]">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-red-500">
                ArmA Reforger ACE Medical
              </div>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-100">
                ACE Medical Assistant
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                Fast local treatment helper for new medics.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <img
                src={aceLogo}
                alt="ACE Logo"
                className="h-20 w-auto object-contain"
              />

              <div className="border border-zinc-700 bg-[#111318] px-3 py-1 text-xs font-semibold text-zinc-300">
                V1
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 p-3">
            <TopTab active={page === "home"} onClick={() => setPage("home")}>
              Home
            </TopTab>
            <TopTab active={page === "treatment"} onClick={() => setPage("treatment")}>
              Treat
            </TopTab>
            <TopTab active={page === "reference"} onClick={() => setPage("reference")}>
              Reference
            </TopTab>
          </div>
        </div>

        {page === "home" && <HomePage setPage={setPage} />}
        {page === "treatment" && (
          <TreatmentPage form={form} updateForm={updateForm} analysis={analysis} />
        )}
        {page === "reference" && <ReferencePage />}
      </div>
      <Analytics />
    </div>
  );
}

function HomePage({ setPage }) {
  return (
    <div className="space-y-3">
      <Panel>
        <div className="text-sm font-semibold text-white">Quick Start</div>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Open the treatment page, select the casualty condition, then follow the generated checklist in order.
        </p>
        <div className="mt-4 grid gap-2">
          <ActionButton tone="green" onClick={() => setPage("treatment")}>Start Treatment</ActionButton>
          <ActionButton tone="blue" onClick={() => setPage("reference")}>Open Quick Reference</ActionButton>
        </div>
      </Panel>

      <Panel>
        <div className="text-sm font-semibold text-white">What this tool does</div>
        <div className="mt-3 space-y-2 text-sm text-slate-300">
          <FeatureLine>Builds a treatment order from the patient state</FeatureLine>
          <FeatureLine>Flags important warnings like overdose risk</FeatureLine>
          <FeatureLine>Designed for fast use during gameplay</FeatureLine>
        </div>
      </Panel>
    </div>
  );
}

function TreatmentPage({ form, updateForm, analysis }) {
  const breathingAbnormal =
  form.respiratoryRate !== "normal" || form.spO2 !== "stable";
  const showPTXQuestions = form.chestWound === "yes" || breathingAbnormal;
  const showAirwayQuestion = form.conscious === "no" || breathingAbnormal;
  const showBleedDetails = form.bleeding === "yes";
  const showOverdoseQuestion = form.morphineInSystem === "yes" || form.conscious === "no";

  return (
    <div className="space-y-3">
      <Panel tone={analysis.badgeTone === "critical" ? "warning" : "default"}>
        <PanelHeader title="Next Action" subtitle="Highest-priority step based on current condition" />
          <div className="mt-3 border border-red-800 bg-red-950/30 px-4 py-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-red-400">
              Do this first
            </div>
            <div className="mt-2 text-lg font-bold text-zinc-100">
              {analysis.nextAction.title}
            </div>
            <div className="mt-1 text-sm leading-5 text-zinc-300">
              {analysis.nextAction.detail}
            </div>
          </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="Patient Input"
          subtitle="Select the casualty condition. Only relevant follow-up questions are shown."
        />

        <div className="mt-4 space-y-4">
          <CompactQuestion label="Is the patient bleeding?">
            <SegmentedChoice value={form.bleeding} setValue={(v) => updateForm("bleeding", v)} options={[["yes", "Yes"], ["no", "No"]]} />
          </CompactQuestion>

          {showBleedDetails && (
            <>
              <CompactQuestion label="Hemorrhage estimate">
                <SegmentedChoice value={form.hemorrhage} setValue={(v) => updateForm("hemorrhage", v)} options={[["class1", "I"], ["class2", "II"], ["class3", "III"], ["class4", "IV"]]} />
              </CompactQuestion>

              <CompactQuestion label="Limb wounds present">
                <SegmentedChoice value={form.limbWounds} setValue={(v) => updateForm("limbWounds", v)} options={[["yes", "Yes"], ["no", "No"]]} />
              </CompactQuestion>
            </>
          )}

          <CompactQuestion label="Is the patient conscious?">
            <SegmentedChoice value={form.conscious} setValue={(v) => updateForm("conscious", v)} options={[["yes", "Yes"], ["no", "No"]]} />
          </CompactQuestion>

          <CompactQuestion label="Heart rate / pulse">
            <SegmentedChoice value={form.heartRate} setValue={(v) => updateForm("heartRate", v)} options={[["nopulse", "No pulse"], ["verylow", "<20"], ["low", "20–40"], ["normal", "40+"]]} />
          </CompactQuestion>

          <CompactQuestion label="Respiratory Rate (RR)">
            <SegmentedChoice
              value={form.respiratoryRate}
              setValue={(v) => updateForm("respiratoryRate", v)}
              options={[
                ["none", "0"],
                ["low", "1–9"],
                ["normal", "10–20"],
                ["high", "21+"],
              ]}
            />
          </CompactQuestion>

          <CompactQuestion label="SpO₂">
            <SegmentedChoice
              value={form.spO2}
              setValue={(v) => updateForm("spO2", v)}
              options={[
                ["arrest", "<65"],
                ["critical", "65–74"],
                ["low", "75–84"],
                ["stable", "85+"],
              ]}
            />
          </CompactQuestion>

          <CompactQuestion label="Chest wound / open PTX">
            <SegmentedChoice value={form.chestWound} setValue={(v) => updateForm("chestWound", v)} options={[["yes", "Yes"], ["no", "No"]]} />
          </CompactQuestion>

          {showPTXQuestions && (
            <CompactQuestion label="Tension PTX suspected">
              <SegmentedChoice value={form.tensionPTX} setValue={(v) => updateForm("tensionPTX", v)} options={[["yes", "Yes"], ["no", "No"]]} />
            </CompactQuestion>
          )}

          {showAirwayQuestion && (
            <CompactQuestion label="Airway blocked / vomit / throat issue">
              <SegmentedChoice value={form.airwayOccluded} setValue={(v) => updateForm("airwayOccluded", v)} options={[["yes", "Yes"], ["no", "No"]]} />
            </CompactQuestion>
          )}

          <CompactQuestion label="Other injuries / fractures">
            <SegmentedChoice value={form.otherInjuries} setValue={(v) => updateForm("otherInjuries", v)} options={[["yes", "Yes"], ["no", "No"]]} />
          </CompactQuestion>

          <CompactQuestion label="Morphine already in system">
            <SegmentedChoice value={form.morphineInSystem} setValue={(v) => updateForm("morphineInSystem", v)} options={[["yes", "Yes"], ["no", "No"]]} />
          </CompactQuestion>

          {showOverdoseQuestion && (
            <CompactQuestion label="Known overdose source">
              <SegmentedChoice value={form.overdoseDrug} setValue={(v) => updateForm("overdoseDrug", v)} options={[["none", "None"], ["morphine", "Morphine"], ["epi", "Epi"], ["other", "Other"]]} />
            </CompactQuestion>
          )}
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Assessment" subtitle="Wiki-aligned diagnosis from current selections" />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <InfoBadge label="Status" value={analysis.status} tone={analysis.badgeTone} />
          <InfoBadge label="Primary" value={analysis.primaryLabel} />
          <InfoBadge label="Blood Loss" value={analysis.hemorrhageLabel} />
          <InfoBadge label="Airway" value={analysis.airwayLabel} />
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Treatment Order" subtitle="Immediate threats first, then stabilization, then recovery" />
        <Checklist analysis={analysis} />
      </Panel>

      <Panel tone="warning">
        <PanelHeader title="Warnings" subtitle="Watch these before giving more medicine" />
        <div className="mt-3 space-y-2">
          {analysis.warnings.map((warning, index) => (
            <div key={index} className="border border-red-900 bg-red-950/30 px-3 py-3 text-sm leading-5 text-red-200">
              {warning}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function ReferencePage() {
  return (
    <div className="space-y-3">
      <Panel>
        <PanelHeader title="Stability" subtitle="Simple field interpretation" />
        <ReferenceList
          rows={[
            ["Stable", "No bleeding, HR 40+, ideal condition"],
            ["Unstable", "HR 20–40 or Class II / III hemorrhage"],
            ["Critical", "Cardiac arrest or Class IV hemorrhage"],
          ]}
        />
      </Panel>

      <Panel>
        <PanelHeader title="Priority Order" subtitle="Suggested treatment sequence" />
        <ReferenceList
          rows={[
            ["1", "Move patient to safety"],
            ["2", "Treat arrest or severe HR issues"],
            ["3", "Control bleeding"],
            ["4", "Fix airway, chest, and breathing"],
            ["5", "Give Saline if hemorrhage is II+"],
            ["6", "Treat fractures and injuries"],
            ["7", "Wake with salts once stable"],
            ["8", "Morphine only when conscious and stable"],
          ]}
        />
      </Panel>

      <Panel>
        <PanelHeader title="Equipment" subtitle="High-value items to carry" />
        <ReferenceList
          rows={[
            ["Bandage", "Stops bleeding"],
            ["Tourniquet", "Fast limb bleed control"],
            ["Saline", "Raises blood volume"],
            ["Chest Seal", "Treats open PTX"],
            ["NCD Kit", "Treats tension PTX"],
            ["LT", "Helps keep airway open"],
            ["Medical Box", "Treats injuries"],
          ]}
        />
      </Panel>

      <Panel>
        <PanelHeader title="Medicines" subtitle="Most relevant field drugs" />
        <ReferenceList
          rows={[
            ["Epinephrine", "Raises HR and improves revive chance"],
            ["Ammonium Carbonate", "Wakes stable unconscious patients"],
            ["Morphine", "Pain control after stabilization"],
            ["Naloxone", "Treats Morphine overdose"],
          ]}
        />
      </Panel>
    </div>
  );
}

function Checklist({ analysis }) {
  const { useState } = React;
  const [done, setDone] = useState({});

  const toggle = (key) => {
    setDone((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const groups = [
    ["Immediate Actions", analysis.immediateSteps],
    ["Stabilization", analysis.stabilizationSteps],
    ["Recovery", analysis.recoverySteps],
  ];

  return (
    <div className="mt-3 space-y-4">
      {groups.map(([groupTitle, steps]) =>
        steps.length ? (
          <div key={groupTitle}>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-500">{groupTitle}</div>
            <div className="space-y-2">
              {steps.map((step, index) => {
                const key = `${groupTitle}-${index}-${step.title}`;
                return (
                  <button
                    key={key}
                    onClick={() => toggle(key)}
                    className={`w-full border px-3 py-3 text-left transition ${
                    done[key]
                      ? "border-red-700 bg-red-950/30"
                      : "border-zinc-800 bg-[#111318] hover:border-zinc-600 hover:bg-[#1b1f27]"
                  }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border text-xs font-bold ${
                      done[key]
                        ? "border-red-700 bg-red-700 text-white"
                        : "border-zinc-700 bg-[#171a21] text-zinc-200"
                    }`}>
                        {done[key] ? '✓' : index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-100">{step.title}</div>
                        <div className="mt-1 text-sm leading-5 text-zinc-400">{step.detail}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null,
      )}
    </div>
  );
}

function Panel({ children, tone = "default" }) {
  const classes =
    tone === "warning"
      ? "border-red-900 bg-[#171a21]"
      : "border-zinc-800 bg-[#171a21]";

  return (
    <section className={`border p-4 shadow-sm ${classes}`}>
      {children}
    </section>
  );
}

function PanelHeader({ title, subtitle }) {
  return (
    <div className="border-b border-zinc-800 pb-3">
      <div className="text-base font-semibold text-zinc-100">{title}</div>
      <div className="mt-1 text-sm leading-5 text-zinc-400">{subtitle}</div>
    </div>
  );
}

function CompactQuestion({ label, children }) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium text-slate-200">{label}</div>
      {children}
    </div>
  );
}

function SegmentedChoice({ value, setValue, options }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {options.map(([optionValue, optionLabel]) => (
        <button
          key={optionValue}
          onClick={() => setValue(optionValue)}
          className={`border px-3 py-2.5 text-sm font-medium transition ${
            value === optionValue
              ? "border-red-700 bg-red-900/40 text-red-200"
              : "border-zinc-700 bg-[#111318] text-zinc-300 hover:border-zinc-500 hover:bg-[#1b1f27]"
          }`}
        >
          {optionLabel}
        </button>
      ))}
    </div>
  );
}

function InfoBadge({ label, value, tone = "default" }) {
  const toneClass =
    tone === "critical"
      ? "border-red-800 bg-red-950/40 text-red-200"
      : tone === "unstable"
      ? "border-amber-700 bg-amber-950/30 text-amber-200"
      : tone === "stable"
      ? "border-emerald-700 bg-emerald-950/30 text-emerald-200"
      : "border-zinc-700 bg-[#111318] text-zinc-100";

  return (
    <div className={`border px-3 py-3 ${toneClass}`}>
      <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function TopTab({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`border px-3 py-2.5 text-sm font-semibold transition ${
        active
          ? "border-red-700 bg-red-700 text-white"
          : "border-zinc-700 bg-[#111318] text-zinc-300 hover:border-zinc-500 hover:bg-[#1b1f27]"
      }`}
    >
      {children}
    </button>
  );
}

function ActionButton({ tone = "blue", children, ...props }) {
  const toneClass =
    tone === "green"
      ? "border-zinc-700 bg-[#111318] text-zinc-100 hover:bg-[#1b1f27]"
      : "border-red-700 bg-red-700 text-white hover:bg-red-600";

  return (
    <button
      {...props}
      className={`border px-4 py-3 text-sm font-semibold transition ${toneClass}`}
    >
      {children}
    </button>
  );
}

function FeatureLine({ children }) {
  return (
    <div className="border border-zinc-800 bg-[#111318] px-3 py-3 text-zinc-300">
      {children}
    </div>
  );
}

function ReferenceList({ rows }) {
  return (
    <div className="mt-3 space-y-2">
      {rows.map(([left, right], index) => (
        <div
          key={index}
          className="grid grid-cols-[90px_1fr] gap-3 border border-zinc-800 bg-[#111318] px-3 py-3 text-sm"
        >
          <div className="font-semibold text-zinc-100">{left}</div>
          <div className="leading-5 text-zinc-400">{right}</div>
        </div>
      ))}
    </div>
  );
}

function analyzePatient(form) {
  const warnings = [];
  const immediateSteps = [];
  const stabilizationSteps = [];
  const recoverySteps = [];

  const cardiacArrest = form.heartRate === "nopulse";
  const veryLowHR = form.heartRate === "verylow";
  const lowHR = form.heartRate === "low";
  const bleeding = form.bleeding === "yes";
  const class2OrMore = ["class2", "class3", "class4"].includes(form.hemorrhage);
  const class3OrMore = ["class3", "class4"].includes(form.hemorrhage);
  const criticalHemorrhage = form.hemorrhage === "class4";
  const unconscious = form.conscious === "no";

  const rrNone = form.respiratoryRate === "none";
  const rrLow = form.respiratoryRate === "low";
  const rrHigh = form.respiratoryRate === "high";

  const spo2Arrest = form.spO2 === "arrest";
  const spo2Critical = form.spO2 === "critical";
  const spo2Low = form.spO2 === "low";

  const airwayBlocked = form.airwayOccluded === "yes";
  const openPTX = form.chestWound === "yes";
  const tensionPTX = form.tensionPTX === "yes";

  const noBreathing = rrNone;
  const poorBreathing = rrLow || rrHigh || spo2Low || spo2Critical || spo2Arrest;
  const unstableAirway = airwayBlocked || noBreathing || poorBreathing;
  const breathingIssue = unstableAirway || openPTX || tensionPTX;

  let status = "Stable";
  let badgeTone = "stable";
  let primaryLabel = "Routine casualty";

  if (
    cardiacArrest ||
    criticalHemorrhage ||
    tensionPTX ||
    rrNone ||
    spo2Arrest
  ) {
    status = "Critical";
    badgeTone = "critical";

    if (cardiacArrest) primaryLabel = "Cardiac arrest";
    else if (tensionPTX) primaryLabel = "Tension pneumothorax";
    else if (criticalHemorrhage) primaryLabel = "Class IV hemorrhage";
    else if (rrNone) primaryLabel = "Not breathing";
    else primaryLabel = "Critical oxygenation";
  } else if (
    veryLowHR ||
    lowHR ||
    class2OrMore ||
    breathingIssue ||
    unconscious
  ) {
    status = "Unstable";
    badgeTone = "unstable";

    if (airwayBlocked) primaryLabel = "Airway obstruction";
    else if (openPTX) primaryLabel = "Open pneumothorax";
    else if (veryLowHR) primaryLabel = "Very low heart rate";
    else if (lowHR) primaryLabel = "Low heart rate";
    else if (unconscious) primaryLabel = "Unconscious casualty";
    else if (spo2Critical || spo2Low) primaryLabel = "Poor oxygenation";
    else primaryLabel = "Blood loss";
  }

  immediateSteps.push({
    title: "Move patient to safety",
    detail: "Before treatment, get the casualty out of the line of fire.",
  });

  if (form.overdoseDrug !== "none") {
    if (form.overdoseDrug === "morphine") {
      immediateSteps.push({
        title: "Administer Naloxone",
        detail: "Morphine overdose suspected. Reverse opioid effects before continuing.",
      });
      warnings.push("Morphine overdose suspected. Do not give more Morphine until the casualty is stable.");
    } else if (form.overdoseDrug === "epi") {
      warnings.push("Epinephrine overdose suspected. Avoid additional Epinephrine unless there is no safer option.");
    } else {
      warnings.push("Non-morphine drug overdose suspected. Avoid stacking more medication unless it is essential.");
    }
  }

  if (cardiacArrest) {
    if (bleeding && form.limbWounds === "yes") {
      immediateSteps.push({
        title: "Apply tourniquets to major limb bleeding first",
        detail: "For a solo medic, use fast tourniquets first so the casualty does not keep losing blood while you begin CPR.",
      });
    }

    if (form.overdoseDrug !== "epi") {
      immediateSteps.push({
        title: "Administer Epinephrine",
        detail: "Use Epinephrine to improve revival chance during cardiac arrest.",
      });
    }

    immediateSteps.push({
      title: "Start CPR loop immediately",
      detail: "Perform CPR continuously and reassess pulse. Do not delay CPR for slow treatments.",
    });

    if (bleeding) {
      immediateSteps.push({
        title: "Bandage remaining bleeding when there is a safe opening",
        detail: "After quick bleed control and CPR start, finish wound treatment when possible.",
      });
    }
  } else if (veryLowHR || (lowHR && unconscious)) {
    if (form.overdoseDrug !== "epi") {
      immediateSteps.push({
        title: "Administer Epinephrine",
        detail: "Heart rate is below stable range. Push vitals back toward survivable values.",
      });
    }
  }

  if (bleeding && !cardiacArrest) {
    if (form.limbWounds === "yes") {
      immediateSteps.push({
        title: "Apply tourniquets to limb wounds",
        detail: "Use tourniquets first for fast limb bleed control while you continue treatment.",
      });
    }

    immediateSteps.push({
      title: "Bandage all active bleeding",
      detail: "Bleeding control comes before recovery drugs. Stop every active wound completely.",
    });

    if (class3OrMore) {
      immediateSteps.push({
        title: "Begin Saline early",
        detail: "Severe hemorrhage detected. Start blood-volume support early while controlling life threats.",
      });
    }
  }

  if (airwayBlocked) {
    immediateSteps.push({
      title: "Clear airway obstruction",
      detail: "Clear vomit if present. Lift the chin, use King LT, or place the casualty in recovery position if needed.",
    });
  }

  if (openPTX) {
    immediateSteps.push({
      title: "Apply Chest Seal",
      detail: "Open chest wound detected. Seal it immediately to prevent worsening lung collapse.",
    });
  }

  if (tensionPTX) {
    immediateSteps.push({
      title: "Use NCD Kit",
      detail: "Tension PTX suspected. Decompress immediately because it can progress to cardiac arrest.",
    });
  }

  const breathingProblem =
    rrNone || rrLow || rrHigh || spo2Low || spo2Critical || spo2Arrest;

  if (breathingProblem && !airwayBlocked && !openPTX && !tensionPTX) {
    immediateSteps.push({
      title: "Support airway and breathing",
      detail: "Breathing or oxygenation is abnormal, but no clear airway blockage or PTX cause is marked. Support the airway, monitor closely, and reassess.",
    });
  }

  if (bleeding && form.limbWounds === "yes") {
    stabilizationSteps.push({
      title: "Remove tourniquets after bleed control",
      detail: "Once wounds are bandaged and no longer bleeding, remove tourniquets to avoid leaving them on unnecessarily.",
    });
  }

  if (class2OrMore && !class3OrMore) {
    stabilizationSteps.push({
      title: "Administer Saline",
      detail: "Class II or higher blood loss supports giving Saline to restore blood volume.",
    });
  }

  if (form.otherInjuries === "yes") {
    stabilizationSteps.push({
      title: "Treat remaining injuries with Medical Box",
      detail: "Use the Medical Box after immediate life threats are under control.",
    });
  }

  if (unconscious && !cardiacArrest) {
    recoverySteps.push({
      title: "Use Ammonium Carbonate once vitals are stable",
      detail: "Only wake the casualty after bleeding, breathing, and vital problems are controlled.",
    });
  }

  if (!unconscious && status === "Stable") {
    recoverySteps.push({
      title: "Give Morphine only for pain control",
      detail: "Morphine is for pain only. Use it after stabilization, since it lowers heart rate and blood pressure.",
    });
  }

  if (unconscious) {
    warnings.push("Do not use Morphine on an unconscious casualty unless you knowingly accept the risk of worsening HR/BP.");
  }

  if (form.morphineInSystem === "yes") {
    warnings.push("Morphine already in system. Watch for overdose and consider Naloxone if overdose signs point to Morphine.");
  }

  if (airwayBlocked) {
    warnings.push("Blocked airway alone makes the casualty unstable. Treat it immediately.");
  }

  if (tensionPTX) {
    warnings.push("Tension PTX can worsen quickly and may progress to cardiac arrest if untreated.");
  }

  if (spo2Arrest || spo2Critical) {
    warnings.push("SpO₂ is dangerously low. Oxygenation failure is a life threat even if the casualty still has a pulse.");
  }

  if (cardiacArrest) {
    warnings.push("Cardiac arrest causes ongoing brain damage if CPR is not being performed.");
  }

  if (!warnings.length) {
    warnings.push("No immediate medication conflict detected. Recheck HR, RR, SpO₂, bleeding, airway, and consciousness after each intervention.");
  }

  const steps = [...immediateSteps, ...stabilizationSteps, ...recoverySteps];
  const nextAction = steps[0] || {
    title: "Monitor patient",
    detail: "No urgent action detected. Keep reassessing vitals and injuries.",
  };

  return {
    status,
    badgeTone,
    primaryLabel,
    hemorrhageLabel: hemorrhageText(form.hemorrhage),
    airwayLabel: breathingText(form),
    immediateSteps,
    stabilizationSteps,
    recoverySteps,
    steps,
    nextAction,
    warnings,
  };
}

function hemorrhageText(value) {
  switch (value) {
    case 'class2': return 'Class II';
    case 'class3': return 'Class III';
    case 'class4': return 'Class IV';
    default: return 'Class I or less';
  }
}

function breathingText(form) {
  if (form.tensionPTX === "yes") return "Tension PTX suspected";
  if (form.chestWound === "yes") return "Open PTX suspected";
  if (form.airwayOccluded === "yes") return "Airway occluded";
  if (form.respiratoryRate === "none") return "Not breathing";
  if (
    form.respiratoryRate === "low" ||
    form.respiratoryRate === "high" ||
    form.spO2 === "low" ||
    form.spO2 === "critical" ||
    form.spO2 === "arrest"
  ) {
    return "Breathing / oxygenation unstable";
  }
  return "Breathing stable";
}
