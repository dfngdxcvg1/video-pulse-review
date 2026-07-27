const legacyTitle = /what viewers should notice/i;
const legacySummary = /conservative update candidate|before final publication/i;
const editorialOverrides = {
  JH03xu8R7fo: {
    summary: "A mirror finish is earned before the final polish. Use this guide to follow the surface from visible wear through preparation and refinement, then judge the result by consistency rather than one bright reflection.",
    takeaways: [
      "Compare the starting scratches, corrosion, and uneven areas before any abrasive work begins.",
      "Watch for a deliberate progression from coarse correction to finer surface preparation.",
      "Notice how edges, corners, and low spots reveal whether the finish is truly even.",
      "Treat reflectivity as a surface result, not proof that structural damage has been repaired."
    ],
    difficulty: "Intermediate",
    editorialMode: "editor-selected"
  },
  t5MwlpayiS4: {
    summary: "Crayon production turns familiar materials into a repeatable color product. Follow the sequence from mixing and forming through cooling, labeling, and packing, with special attention to how the line keeps shape and color consistent.",
    takeaways: [
      "Identify when wax and pigment become a uniform mixture.",
      "Watch how molds, cooling, and release timing affect the finished crayon shape.",
      "Look for the point where labels and packaging become part of quality control.",
      "Compare automated movement with the steps that still require a visual check."
    ],
    difficulty: "Industrial process",
    editorialMode: "editor-selected"
  },
  kugqGatwLDY: {
    summary: "An 1890s safe combines heavy construction with a precise locking mechanism. The useful questions are whether original parts can be preserved, how corrosion affects movement, and whether the final door and lock operate reliably.",
    takeaways: [
      "Start with the condition of the hinges, door fit, fasteners, and lock components.",
      "Notice which parts are cleaned and preserved instead of automatically replaced.",
      "Watch how paint and surface work are kept separate from the lock mechanism.",
      "Use door alignment and lock operation as the most meaningful final checks."
    ],
    difficulty: "Advanced",
    editorialMode: "editor-selected"
  },
  YTZxirOPjgY: {
    summary: "A seized vise is only restored when it grips and travels correctly again. Follow the screw, slide, jaws, and mounting surfaces, then compare the mechanical result with the cosmetic finish.",
    takeaways: [
      "Identify where corrosion or deformation prevents the moving jaw from traveling.",
      "Watch how force is applied to stuck parts without damaging threads or castings.",
      "Check jaw alignment, screw movement, and contact surfaces during reassembly.",
      "Give more weight to the final clamping test than to fresh paint."
    ],
    difficulty: "Intermediate",
    editorialMode: "editor-selected"
  },
  JhFY1sUnMjA: {
    summary: "A 1949 Olympia typewriter depends on dozens of small mechanical relationships. Use this guide to follow the carriage, keys, linkages, springs, and platen, then judge the restoration by an actual typing and alignment test.",
    takeaways: [
      "Look for a parts layout that preserves the position of small springs, screws, and linkages.",
      "Notice how the carriage and key mechanisms are cleaned without forcing delicate parts.",
      "Watch for alignment, return movement, and ribbon-path checks during assembly.",
      "Use consistent key action and typed characters as the final evidence of function."
    ],
    difficulty: "Advanced",
    editorialMode: "editor-selected"
  },
  IIwTCyu2wS4: {
    summary: "Good engineering begins before tools touch material. This guide focuses on problem framing, constraints, iteration, and testing so the finished build can be judged by evidence rather than novelty.",
    takeaways: [
      "Define the problem and constraints before comparing possible solutions.",
      "Separate a useful prototype from a polished object that has not been tested.",
      "Look for iteration prompted by measurements, failed attempts, or new information.",
      "Judge the result by repeatability and tradeoffs, not only the final demonstration."
    ],
    difficulty: "Beginner-friendly concepts",
    editorialMode: "editor-selected"
  },
  DJmp2XOXtXQ: {
    summary: "A grindstone restoration must balance preservation with safe operation. Follow the frame, bearings, wheel condition, and drive parts, then look for a controlled working test rather than assuming an old abrasive wheel is safe.",
    takeaways: [
      "Inspect the wheel and supporting structure before focusing on appearance.",
      "Notice how bearings, shafts, and alignment affect smooth rotation.",
      "Look for conservative testing after reassembly.",
      "Do not assume a restored abrasive wheel is safe without a proper condition assessment."
    ],
    difficulty: "Advanced",
    editorialMode: "editor-selected"
  },
  ux5Ek0iXojE: {
    summary: "A hand plane is a compact test of restoration accuracy. Follow the sole, blade, chip breaker, frog, handles, and adjustments, then use the final shaving to judge sharpness and setup.",
    takeaways: [
      "Compare rust removal with preservation of flat reference surfaces.",
      "Watch how the blade and chip breaker are prepared and fitted together.",
      "Notice whether adjustment parts move freely without excess play.",
      "Use a continuous, controlled wood shaving as the final functional check."
    ],
    difficulty: "Intermediate",
    editorialMode: "editor-selected"
  },
  "B-ZHAPLjHFU": {
    summary: "A vintage belt sander adds electrical and tracking questions to ordinary surface restoration. Follow the motor, bearings, platen, rollers, wiring, and belt path before judging the machine by its final running test.",
    takeaways: [
      "Inspect wiring and moving assemblies before power is applied.",
      "Notice how bearings, rollers, and the platen affect belt movement.",
      "Watch for tracking adjustments that keep the belt centered under load.",
      "Treat guards, electrical condition, and a stable test run as part of the restoration result."
    ],
    difficulty: "Advanced",
    editorialMode: "editor-selected"
  }
};

function decodeEntities(value = "") {
  return String(value)
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function shorten(value, maxLength) {
  const text = String(value).trim();
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength + 1);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > 36 ? lastSpace : maxLength).trim()}...`;
}

export function cleanSourceTitle(value = "") {
  let title = decodeEntities(value)
    .replace(/\p{Extended_Pictographic}|\uFE0F|\u200D/gu, "")
    .replace(/#\S+/g, " ")
    .replace(/^(?:unbelievable|shocking|incredible)\s+/i, "")
    .replace(/\b(restoration)(?:\s+\1){1,}/gi, "$1")
    .replace(/\s*[-|:]\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const letters = title.match(/[a-z]/gi) || [];
  const uppercase = title.match(/[A-Z]/g) || [];
  if (letters.length > 8 && uppercase.length / letters.length > 0.72) {
    title = title.toLowerCase().replace(/^[a-z]/, (letter) => letter.toUpperCase());
  }
  return title || "Workshop video";
}

export function detectEditorialType(item) {
  const text = `${item.sourceTitle || ""} ${item.keyword || ""} ${item.query || ""}`;
  if (/factory|manufactur|production line|how .* (?:is|are) made|mass produc|assembly line/i.test(text)) {
    return "manufacturing";
  }
  if (/restor|repair|rebuild|rust|refurbish|renovat|bring.*back|old tool|antique/i.test(text)) {
    return "restoration";
  }
  return "engineering";
}

function difficultyFor(item, type) {
  const text = `${item.sourceTitle || ""} ${item.keyword || ""}`;
  if (/high voltage|engine|motorcycle|tractor|excavator|lathe|welding|industrial|hydraulic|electrical/i.test(text)) {
    return "Advanced";
  }
  return type === "manufacturing" ? "Industrial process" : "Intermediate";
}

export function buildEditorial(item) {
  const sourceTitle = cleanSourceTitle(item.sourceTitle);
  const type = detectEditorialType(item);
  const channel = String(item.channel || "the original creator").replace(/\s+/g, " ").trim();
  const base = shorten(sourceTitle, 72);
  const title = type === "restoration"
    ? `${base} | Restoration Process Guide`
    : type === "manufacturing"
      ? `${base} | Factory Process Guide`
      : `${base} | Engineering Breakdown`;

  const content = {
    restoration: {
      label: "Restoration",
      summary: `This viewing guide accompanies "${sourceTitle}" by ${channel}. It focuses on how to assess the starting condition, follow the repair choices, and separate a cosmetic finish from a result that restores useful function.`,
      takeaways: [
        `Identify the damage, wear, corrosion, or missing parts visible at the start of ${sourceTitle}.`,
        "Watch how components are documented, separated, cleaned, and evaluated before replacement or refinishing.",
        "Compare surface preparation and mechanical repair; a polished finish does not always prove the object works.",
        "Use the final test, fit, movement, or operating check to judge the result."
      ],
      safetyNotes: [
        "Restoration videos can involve solvents, rust removal, electricity, sharp edges, heat, and pressurized parts.",
        "Treat the video as a demonstration, not a complete safety procedure; use appropriate training and protective equipment."
      ]
    },
    manufacturing: {
      label: "Manufacturing",
      summary: `This guide accompanies "${sourceTitle}" by ${channel} and helps viewers follow the production sequence. Look for the change from raw material to formed parts, the role of repeatable machinery, and the checks used before a finished product leaves the line.`,
      takeaways: [
        `Track the material or components entering the process shown in ${sourceTitle}.`,
        "Notice which steps shape, join, heat, coat, fill, or package the product.",
        "Look for fixtures, sensors, gauges, or human checks that keep repeated work consistent.",
        "Compare production speed with the points where quality control slows the line down."
      ],
      safetyNotes: [
        "Industrial equipment relies on guards, lockout procedures, ventilation, and trained operators that may not be visible on camera.",
        "Do not reproduce factory operations without the equipment documentation and workplace controls required for the process."
      ]
    },
    engineering: {
      label: "Engineering",
      summary: `This viewing guide accompanies "${sourceTitle}" by ${channel}. It frames the video around the problem being solved, the mechanism or build choice involved, and the evidence that shows whether the idea works outside the initial demonstration.`,
      takeaways: [
        `Define the practical problem or constraint behind ${sourceTitle} before judging the finished build.`,
        "Identify the mechanism, material choice, or geometry that does most of the work.",
        "Watch for iteration: failed attempts and design changes often explain more than the final reveal.",
        "Judge the result by testing, repeatability, and tradeoffs rather than appearance alone."
      ],
      safetyNotes: [
        "Engineering demonstrations may omit calculations, load limits, guarding, electrical protection, or long-term testing.",
        "Verify designs against reliable technical guidance before building or operating a similar device."
      ]
    }
  }[type];

  return {
    proposedTitle: title,
    summary: content.summary,
    takeaways: content.takeaways,
    timestamps: [],
    timestampsVerified: false,
    topicType: content.label,
    difficulty: difficultyFor(item, type),
    safetyNotes: content.safetyNotes,
    editorialMode: "metadata-assisted"
  };
}

export function normalizeReviewedItem(item) {
  const generated = buildEditorial(item);
  const override = editorialOverrides[item.videoId];
  const isLegacy = legacyTitle.test(item.proposedTitle || "") || legacySummary.test(item.summary || "");
  if (override) {
    return {
      ...item,
      ...generated,
      ...override,
      proposedTitle: item.proposedTitle || generated.proposedTitle,
      timestamps: [],
      timestampsVerified: false,
      safetyNotes: item.safetyNotes?.length ? item.safetyNotes : generated.safetyNotes,
      topicType: item.topicType || generated.topicType
    };
  }
  return {
    ...item,
    proposedTitle: isLegacy ? generated.proposedTitle : (item.proposedTitle || generated.proposedTitle),
    summary: isLegacy ? generated.summary : (item.summary || generated.summary),
    takeaways: isLegacy || !item.takeaways?.length ? generated.takeaways : item.takeaways,
    timestamps: item.timestampsVerified ? (item.timestamps || []) : [],
    timestampsVerified: Boolean(item.timestampsVerified),
    topicType: item.topicType || generated.topicType,
    difficulty: item.difficulty || generated.difficulty,
    safetyNotes: item.safetyNotes?.length ? item.safetyNotes : generated.safetyNotes,
    editorialMode: isLegacy ? generated.editorialMode : (item.editorialMode || "editor-selected")
  };
}
