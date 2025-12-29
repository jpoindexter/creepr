/**
 * Design System Audit Report Factory
 * Creates empty report structures
 */

import type { DesignSystemAuditReport } from "./types";
import { AUDIT_PATTERNS } from "./patterns";

export function createEmptyReport(): DesignSystemAuditReport {
  return {
    generatedAt: new Date().toISOString(),
    totalFiles: 0,
    totalPatterns: 0,
    categories: {
      colors: {
        bgColors: { ...AUDIT_PATTERNS.colors.bgColors, count: 0, violations: [] },
        textColors: { ...AUDIT_PATTERNS.colors.textColors, count: 0, violations: [] },
        borderColors: { ...AUDIT_PATTERNS.colors.borderColors, count: 0, violations: [] },
        ringColors: { ...AUDIT_PATTERNS.colors.ringColors, count: 0, violations: [] },
        hexColors: { ...AUDIT_PATTERNS.colors.hexColors, count: 0, violations: [] },
        rgbColors: { ...AUDIT_PATTERNS.colors.rgbColors, count: 0, violations: [] },
        hslColors: { ...AUDIT_PATTERNS.colors.hslColors, count: 0, violations: [] },
        oklchColors: { ...AUDIT_PATTERNS.colors.oklchColors, count: 0, violations: [] },
        cssVarColors: { ...AUDIT_PATTERNS.colors.cssVarColors, count: 0, violations: [] },
      },
      spacing: {
        padding: { ...AUDIT_PATTERNS.spacing.padding, count: 0, violations: [] },
        margin: { ...AUDIT_PATTERNS.spacing.margin, count: 0, violations: [] },
        gap: { ...AUDIT_PATTERNS.spacing.gap, count: 0, violations: [] },
        space: { ...AUDIT_PATTERNS.spacing.space, count: 0, violations: [] },
      },
      sizing: {
        width: { ...AUDIT_PATTERNS.sizing.width, count: 0, violations: [] },
        height: { ...AUDIT_PATTERNS.sizing.height, count: 0, violations: [] },
        maxWidth: { ...AUDIT_PATTERNS.sizing.maxWidth, count: 0, violations: [] },
        maxHeight: { ...AUDIT_PATTERNS.sizing.maxHeight, count: 0, violations: [] },
        minWidth: { ...AUDIT_PATTERNS.sizing.minWidth, count: 0, violations: [] },
        minHeight: { ...AUDIT_PATTERNS.sizing.minHeight, count: 0, violations: [] },
      },
      borderRadius: {
        all: { ...AUDIT_PATTERNS.borderRadius.all, count: 0, violations: [] },
      },
      borders: {
        borderWidth: { ...AUDIT_PATTERNS.borders.borderWidth, count: 0, violations: [] },
        borderStyle: { ...AUDIT_PATTERNS.borders.borderStyle, count: 0, violations: [] },
      },
      shadows: {
        all: { ...AUDIT_PATTERNS.shadows.all, count: 0, violations: [] },
      },
      typography: {
        fontSize: { ...AUDIT_PATTERNS.typography.fontSize, count: 0, violations: [] },
        fontWeight: { ...AUDIT_PATTERNS.typography.fontWeight, count: 0, violations: [] },
        fontFamily: { ...AUDIT_PATTERNS.typography.fontFamily, count: 0, violations: [] },
        lineHeight: { ...AUDIT_PATTERNS.typography.lineHeight, count: 0, violations: [] },
        letterSpacing: { ...AUDIT_PATTERNS.typography.letterSpacing, count: 0, violations: [] },
        textAlign: { ...AUDIT_PATTERNS.typography.textAlign, count: 0, violations: [] },
      },
      layout: {
        display: { ...AUDIT_PATTERNS.layout.display, count: 0, violations: [] },
        flex: { ...AUDIT_PATTERNS.layout.flex, count: 0, violations: [] },
        grid: { ...AUDIT_PATTERNS.layout.grid, count: 0, violations: [] },
        position: { ...AUDIT_PATTERNS.layout.position, count: 0, violations: [] },
        zIndex: { ...AUDIT_PATTERNS.layout.zIndex, count: 0, violations: [] },
      },
      effects: {
        opacity: { ...AUDIT_PATTERNS.effects.opacity, count: 0, violations: [] },
        blur: { ...AUDIT_PATTERNS.effects.blur, count: 0, violations: [] },
        transition: { ...AUDIT_PATTERNS.effects.transition, count: 0, violations: [] },
        animation: { ...AUDIT_PATTERNS.effects.animation, count: 0, violations: [] },
      },
      cssVariables: {
        spacing: { ...AUDIT_PATTERNS.cssVariables.spacing, count: 0, violations: [] },
        sizing: { ...AUDIT_PATTERNS.cssVariables.sizing, count: 0, violations: [] },
        radius: { ...AUDIT_PATTERNS.cssVariables.radius, count: 0, violations: [] },
        shadow: { ...AUDIT_PATTERNS.cssVariables.shadow, count: 0, violations: [] },
        font: { ...AUDIT_PATTERNS.cssVariables.font, count: 0, violations: [] },
      },
      inlineStyles: {
        colors: { ...AUDIT_PATTERNS.inlineStyles.colors, count: 0, violations: [] },
        spacing: { ...AUDIT_PATTERNS.inlineStyles.spacing, count: 0, violations: [] },
        sizing: { ...AUDIT_PATTERNS.inlineStyles.sizing, count: 0, violations: [] },
        fonts: { ...AUDIT_PATTERNS.inlineStyles.fonts, count: 0, violations: [] },
      },
      interactivity: {
        cursor: { ...AUDIT_PATTERNS.interactivity.cursor, count: 0, violations: [] },
        pointerEvents: { ...AUDIT_PATTERNS.interactivity.pointerEvents, count: 0, violations: [] },
        userSelect: { ...AUDIT_PATTERNS.interactivity.userSelect, count: 0, violations: [] },
        scroll: { ...AUDIT_PATTERNS.interactivity.scroll, count: 0, violations: [] },
      },
      visibility: {
        overflow: { ...AUDIT_PATTERNS.visibility.overflow, count: 0, violations: [] },
        visibility: { ...AUDIT_PATTERNS.visibility.visibility, count: 0, violations: [] },
        truncate: { ...AUDIT_PATTERNS.visibility.truncate, count: 0, violations: [] },
      },
      transforms: {
        scale: { ...AUDIT_PATTERNS.transforms.scale, count: 0, violations: [] },
        rotate: { ...AUDIT_PATTERNS.transforms.rotate, count: 0, violations: [] },
        translate: { ...AUDIT_PATTERNS.transforms.translate, count: 0, violations: [] },
        skew: { ...AUDIT_PATTERNS.transforms.skew, count: 0, violations: [] },
        origin: { ...AUDIT_PATTERNS.transforms.origin, count: 0, violations: [] },
      },
      filters: {
        blur: { ...AUDIT_PATTERNS.filters.blur, count: 0, violations: [] },
        brightness: { ...AUDIT_PATTERNS.filters.brightness, count: 0, violations: [] },
        contrast: { ...AUDIT_PATTERNS.filters.contrast, count: 0, violations: [] },
        grayscale: { ...AUDIT_PATTERNS.filters.grayscale, count: 0, violations: [] },
        saturate: { ...AUDIT_PATTERNS.filters.saturate, count: 0, violations: [] },
        invert: { ...AUDIT_PATTERNS.filters.invert, count: 0, violations: [] },
        sepia: { ...AUDIT_PATTERNS.filters.sepia, count: 0, violations: [] },
        dropShadow: { ...AUDIT_PATTERNS.filters.dropShadow, count: 0, violations: [] },
      },
      gradients: {
        direction: { ...AUDIT_PATTERNS.gradients.direction, count: 0, violations: [] },
        stops: { ...AUDIT_PATTERNS.gradients.stops, count: 0, violations: [] },
      },
      textStyles: {
        decoration: { ...AUDIT_PATTERNS.textStyles.decoration, count: 0, violations: [] },
        transform: { ...AUDIT_PATTERNS.textStyles.transform, count: 0, violations: [] },
        indent: { ...AUDIT_PATTERNS.textStyles.indent, count: 0, violations: [] },
        verticalAlign: { ...AUDIT_PATTERNS.textStyles.verticalAlign, count: 0, violations: [] },
      },
      objectFit: {
        fit: { ...AUDIT_PATTERNS.objectFit.fit, count: 0, violations: [] },
        position: { ...AUDIT_PATTERNS.objectFit.position, count: 0, violations: [] },
      },
      aspectRatio: {
        all: { ...AUDIT_PATTERNS.aspectRatio.all, count: 0, violations: [] },
      },
      outlines: {
        width: { ...AUDIT_PATTERNS.outlines.width, count: 0, violations: [] },
        style: { ...AUDIT_PATTERNS.outlines.style, count: 0, violations: [] },
        color: { ...AUDIT_PATTERNS.outlines.color, count: 0, violations: [] },
        offset: { ...AUDIT_PATTERNS.outlines.offset, count: 0, violations: [] },
      },
      rings: {
        width: { ...AUDIT_PATTERNS.rings.width, count: 0, violations: [] },
        offset: { ...AUDIT_PATTERNS.rings.offset, count: 0, violations: [] },
        inset: { ...AUDIT_PATTERNS.rings.inset, count: 0, violations: [] },
      },
      divide: {
        width: { ...AUDIT_PATTERNS.divide.width, count: 0, violations: [] },
        color: { ...AUDIT_PATTERNS.divide.color, count: 0, violations: [] },
        style: { ...AUDIT_PATTERNS.divide.style, count: 0, violations: [] },
      },
      dynamicClasses: {
        templateLiterals: {
          ...AUDIT_PATTERNS.dynamicClasses.templateLiterals,
          count: 0,
          violations: [],
        },
        clsxCn: { ...AUDIT_PATTERNS.dynamicClasses.clsxCn, count: 0, violations: [] },
        conditionalClasses: {
          ...AUDIT_PATTERNS.dynamicClasses.conditionalClasses,
          count: 0,
          violations: [],
        },
      },
      jsVariables: {
        colorVars: { ...AUDIT_PATTERNS.jsVariables.colorVars, count: 0, violations: [] },
        spacingVars: { ...AUDIT_PATTERNS.jsVariables.spacingVars, count: 0, violations: [] },
        sizeVars: { ...AUDIT_PATTERNS.jsVariables.sizeVars, count: 0, violations: [] },
        styleObjects: { ...AUDIT_PATTERNS.jsVariables.styleObjects, count: 0, violations: [] },
      },
      themeConfig: {
        tailwindExtend: { ...AUDIT_PATTERNS.themeConfig.tailwindExtend, count: 0, violations: [] },
        cssVariableDeclarations: {
          ...AUDIT_PATTERNS.themeConfig.cssVariableDeclarations,
          count: 0,
          violations: [],
        },
        scssVariables: { ...AUDIT_PATTERNS.themeConfig.scssVariables, count: 0, violations: [] },
      },
    },
    patternSummary: {},
    summary: "",
    inconsistencies: {
      totalInconsistencies: 0,
      critical: 0,
      warning: 0,
      info: 0,
      inconsistencies: [],
    },
  };
}
