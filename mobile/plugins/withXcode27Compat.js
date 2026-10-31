// Makes the Expo SDK 54 native template build and launch with Xcode 27:
// - the iOS 27 SDK refuses to launch apps without the UIScene life cycle;
// - Xcode 27 rejects pod targets below iOS 15.
const {
  withAppDelegate,
  withInfoPlist,
  withPodfile,
} = require("expo/config-plugins");

const MIN_POD_TARGET = "15.1";
const MARKER = "withXcode27Compat";

const SCENE_DELEGATE = `
// @generated ${MARKER}: the iOS 27 SDK requires the UIScene life cycle.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate,
          let window = appDelegate.window else { return }
    window.windowScene = windowScene
    window.makeKeyAndVisible()
    self.window = window
  }
}
`;

const POD_TARGET_FIX = `
    # @generated ${MARKER}: Xcode 27 rejects pod targets below iOS 15.
    installer.pods_project.targets.each do |t|
      t.build_configurations.each do |c|
        if c.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].to_f < ${MIN_POD_TARGET}
          c.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${MIN_POD_TARGET}'
        end
      end
    end`;

const withSceneManifest = (config) =>
  withInfoPlist(config, (config) => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: "Default",
            UISceneDelegateClassName: "$(PRODUCT_MODULE_NAME).SceneDelegate",
          },
        ],
      },
    };
    return config;
  });

const withSceneDelegate = (config) =>
  withAppDelegate(config, (config) => {
    const { modResults } = config;
    if (modResults.language !== "swift") {
      throw new Error(`${MARKER}: expected a Swift AppDelegate`);
    }
    if (!modResults.contents.includes(MARKER)) {
      modResults.contents += SCENE_DELEGATE;
    }
    return config;
  });

const withPodTargetFix = (config) =>
  withPodfile(config, (config) => {
    const { modResults } = config;
    if (modResults.contents.includes(MARKER)) return config;
    // Insert right after the react_native_post_install(...) call.
    const pattern = /(react_native_post_install\([\s\S]*?\n\s*\))/;
    if (!pattern.test(modResults.contents)) {
      throw new Error(`${MARKER}: react_native_post_install not found in Podfile`);
    }
    modResults.contents = modResults.contents.replace(
      pattern,
      `$1${POD_TARGET_FIX}`
    );
    return config;
  });

module.exports = (config) =>
  withPodTargetFix(withSceneDelegate(withSceneManifest(config)));
