import * as Haptics from "expo-haptics";

// Haptics are best-effort: unsupported devices or disabled system haptics
// must never break an interaction.
const safely = (run: () => Promise<void>) => {
  run().catch(() => {});
};

export const haptics = {
  /** A discrete choice changed: status, slider step, theme. */
  selection: () => safely(() => Haptics.selectionAsync()),
  /** A light action: share, pin. */
  light: () =>
    safely(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Something was removed or reset. */
  warning: () =>
    safely(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
    ),
  /** Something was saved. */
  success: () =>
    safely(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    ),
};
