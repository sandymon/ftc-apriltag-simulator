export const inputs = [
  { id: "pipeline", label: "Pipeline index", group: "Input", unit: "0–9", meaning: "A pipeline is one saved set of camera and detection settings that Limelight runs on each image. Each numbered slot stores a complete pipeline, and your Java code must request the same slot.", effect: "Switch slots in the lab. Each slot remembers its own settings.", mistake: "Pipeline 0 is only an AprilTag pipeline after you configure it. A pipeline number is not an AprilTag ID.", source: "pipeline" },
  { id: "type", label: "Pipeline type", group: "Input", unit: "Choice", meaning: "Select AprilTags (called Fiducial Markers in some versions) to detect tags.", effect: "Select Color to see why a running pipeline can return no fiducials.", mistake: "A pipeline number does not specify the algorithm.", source: "tracking" },
  { id: "source", label: "Source image", group: "Input", unit: "Camera / Snapshot", meaning: "Camera uses the live scene. Snapshot uses a stored frame for repeatable tuning.", effect: "Snapshot freezes the lab capture while the field can still change.", mistake: "A snapshot cannot reveal new robot motion.", source: "pipeline" },
  { id: "resolution", label: "Resolution & zoom", group: "Input", unit: "Pixels / ×", meaning: "Higher resolution gives more pixels across a tag. Supported sensor zoom modes narrow the captured region.", effect: "Change resolution and zoom to compare modeled range, FPS, and field of view.", mistake: "High resolution does not guarantee a high frame rate. Available modes depend on hardware.", source: "tracking" },
  { id: "orientation", label: "Stream orientation", group: "Input", unit: "Degrees", meaning: "Rotates the displayed stream after processing.", effect: "Rotate the preview and watch tx stay unchanged.", mistake: "This control does not correct the camera mount pose used by localization.", source: "pipeline" },
  { id: "exposure", label: "Exposure", group: "Input", unit: "ms in this lab", meaning: "Exposure is how long the camera gathers light for one picture. A shorter exposure makes moving tags look less blurry, but it also makes the picture darker.", effect: "Lower exposure until the image loses contrast, then recover detection.", mistake: "The historical UI uses 0.01 ms increments. Always check your installed UI unit.", source: "pipeline" },
  { id: "black", label: "Black level offset", group: "Input", unit: "Sensor setting", meaning: "Raises the black cutoff and darkens the image. AprilTag setup commonly starts at zero.", effect: "Increasing it removes contrast in the teaching preview.", mistake: "A value useful for retroreflective tape can hide an unlit AprilTag.", source: "tracking" },
  { id: "gain", label: "Sensor gain", group: "Input", unit: "Device setting", meaning: "Amplifies the sensor signal, increasing brightness and noise.", effect: "Use gain with exposure to recover a dark tag; high gain adds modeled jitter.", mistake: "Gain does not collect more light and does not remove motion blur.", source: "pipeline" },
  { id: "flicker", label: "Flicker correction", group: "Input", unit: "Off / 50 / 60 Hz", meaning: "Flicker correction accounts for the rapid on-and-off cycle of powered light sources. Matching the setting to the lights can reduce moving bright and dark bands in the camera image.", effect: "The lab illustrates banding under a simulated 60 Hz light source.", mistake: "The reference deck's 50 Hz choice is not universal. The correct setting depends on the actual venue lights.", source: "deck" },
  { id: "balance", label: "Red & blue balance", group: "Input", unit: "Relative channel gain", meaning: "Adjusts white balance by scaling red and blue channels. Leave defaults unless there is a reason to tune.", effect: "Change the preview tint without changing ground-truth geometry.", mistake: "White balance is not camera calibration.", source: "pipeline" },
  { id: "family", label: "Tag family", group: "Configuration", unit: "36h11", meaning: "The decoder must use the tag's encoding family. This workshop uses AprilTag Classic 36h11.", effect: "Select the wrong family to reject all practice tags.", mistake: "A numeric ID alone cannot tell you which family the tag belongs to.", source: "intro" },
  { id: "size", label: "Marker size", group: "Configuration", unit: "mm", meaning: "The physical width across the outside of the black border, excluding the white margin.", effect: "Change assumed size and see the range estimate scale incorrectly.", mistake: "The practice tags are 50.8 mm. Use measured tags or a verified season specification on a robot.", source: "intro" },
  { id: "downscale", label: "Detector downscale", group: "Configuration", unit: "Factor", meaning: "Reduces work in the detection stage. Increasing it can raise FPS at the cost of detection range.", effect: "Compare modeled FPS and far-tag visibility.", mistake: "This is distinct from lowering the capture resolution used for pose estimation.", source: "tracking" },
  { id: "quality", label: "Quality threshold", group: "Configuration", unit: "Whole-number score", meaning: "LimelightOS displays this threshold as a whole number. It rejects weak tag candidates; confirm the exact range and direction in the installed version.", effect: "The lab mirrors the integer input with an illustrative 0–10 teaching scale.", mistake: "Do not enter a decimal confidence value such as 0.3 or assume the range is identical across LimelightOS versions.", source: "deck" },
  { id: "filter", label: "ID filters", group: "Configuration", unit: "Comma-separated IDs", meaning: "Restricts accepted tags, for example 20,21. Blank accepts every visible practice tag.", effect: "Excluded tags remain visible in the preview with an orange outline.", mistake: "The tag might be in the picture while intentionally excluded from results.", source: "tracking" },
  { id: "crop", label: "X / Y crop", group: "Configuration", unit: "Normalized image region", meaning: "Restricts the region inspected for targets. Less image area can reduce processing cost.", effect: "Narrow the centered crop window and move a tag outside it.", mistake: "A crop also removes useful targets. It does not change the physical camera lens.", source: "tracking" },
  { id: "sort", label: "Sort & group targets", group: "Configuration", unit: "Selection rule", meaning: "Several tags can be detected at once. A selection/grouping rule determines the base targeting crosshair.", effect: "Switch largest, highest, lowest, and group center to move the active crosshair.", mistake: "Base tx/ty can describe a different target from the one you intended.", source: "tracking" },
  { id: "full3d", label: "Full 3D targeting", group: "Advanced", unit: "On / Off", meaning: "Enables pose outputs used for 3D target tracking and localization.", effect: "Reveal the pose frame inspector in the lab.", mistake: "A valid 2D target does not automatically establish a trustworthy robot field pose.", source: "java" },
  { id: "mount", label: "Camera pose on robot", group: "Advanced", unit: "m / degrees", meaning: "Enter camera translation and rotation relative to robot center using the axes documented by the installed UI.", effect: "Move the camera forward or right of robot center and rotate its mounting yaw.", mistake: "The camera lens and robot center are rarely the same point.", source: "java" },
  { id: "map", label: "Field map & visualizer", group: "Advanced", unit: "Named coordinate frame", meaning: "A field map supplies known tag positions. A visualizer chooses which object's pose is expressed in which frame.", effect: "Compare camera-relative, robot-relative, and field-relative values for the practice map.", mistake: "This lab's movable practice layout is not an official season map. Verify season, units, and origin before importing a real map.", source: "java" },
  { id: "poi", label: "Point-of-interest offset", group: "Advanced", unit: "m", meaning: "Moves the reference point to a known location relative to the tag, such as an adjacent scoring feature.", effect: "Add a lateral offset and see the selected reference point move.", mistake: "The camera has not detected that neighboring object; its position is inferred from the offset.", source: "deck" },
] as const;

export type InputGuidance = {
  recommendation: string;
  pros: string;
  cons: string;
  choices?: { option: string; useWhen: string; tradeoff: string }[];
};

export const inputGuidance: Record<string, InputGuidance> = {
  pipeline: {
    recommendation: "Use one clearly named slot for the workshop, such as slot 0, and make pipelineSwitch() request that same number.",
    pros: "Separate slots let you switch complete configurations without retuning every control.",
    cons: "The wrong slot can run successfully while using the wrong detector, exposure, filters, or calibration.",
  },
  type: {
    recommendation: "Choose AprilTags for this workshop and confirm the saved pipeline type before testing Java.",
    pros: "The AprilTag pipeline returns fiducial IDs, target angles, and configured pose outputs.",
    cons: "Other pipeline types can still show a camera stream but will not return AprilTag fiducials.",
    choices: [
      { option: "AprilTags", useWhen: "Reading FTC 36h11 tags", tradeoff: "Uses the fiducial detector and its tag-specific settings." },
      { option: "Color", useWhen: "Tracking a colored object or retroreflective target", tradeoff: "Does not decode AprilTag IDs." },
    ],
  },
  source: {
    recommendation: "Use Camera for robot operation. Use Snapshot only while tuning a repeatable captured image.",
    pros: "A snapshot makes before-and-after setting comparisons repeatable.",
    cons: "A snapshot cannot show changes in lighting, robot motion, target position, or motion blur.",
    choices: [
      { option: "Camera", useWhen: "Testing live detection and running the robot", tradeoff: "The scene can change between comparisons." },
      { option: "Snapshot", useWhen: "Isolating the effect of one pipeline setting", tradeoff: "Results describe the stored frame, not the current field." },
    ],
  },
  resolution: {
    recommendation: "Start at 640×480 with no sensor zoom. Increase resolution only when a distant tag lacks enough pixels, then verify FPS and latency.",
    pros: "More pixels can improve distant-tag detection and corner/pose stability. They may preserve more usable edge detail when blur is mild. Sensor zoom can concentrate pixels in a narrower view.",
    cons: "Higher resolution costs processing time and bandwidth, and it does not remove motion blur. Zoom narrows field of view, so targets leave the image sooner.",
    choices: [
      { option: "640 width", useWhen: "Starting setup, close-to-medium range, or faster updates", tradeoff: "Wider performance margin; fewer pixels on a distant tag." },
      { option: "960 width", useWhen: "A supported middle setting needs more detail", tradeoff: "More detail with added processing cost; verify availability in your OS version." },
      { option: "1280 width", useWhen: "Longer range needs more pixels and lower FPS is acceptable", tradeoff: "More image detail, but a lower pipeline frame rate than smaller resolutions." },
      { option: "Zoom 1×", useWhen: "Normal starting point and widest field of view", tradeoff: "Least detail on a distant tag." },
      { option: "Zoom 2–3×", useWhen: "The target remains in a known, narrow part of the image", tradeoff: "More target pixels but a much smaller search view." },
    ],
  },
  orientation: {
    recommendation: "Use 0° when the camera is mounted upright. Otherwise choose the rotation that makes the stream upright for the operator.",
    pros: "An upright preview is easier to inspect and teach from.",
    cons: "Stream rotation does not fix an incorrect camera-to-robot pose or physically widen the view.",
    choices: [
      { option: "0°", useWhen: "Camera and preview are already upright", tradeoff: "No display rotation." },
      { option: "90° / 270°", useWhen: "The camera is mounted on its side", tradeoff: "Corrects the displayed orientation; verify the separate mounting transform." },
      { option: "180°", useWhen: "The camera is mounted upside down", tradeoff: "Makes the preview upright; does not replace pose configuration." },
    ],
  },
  exposure: {
    recommendation: "Use the lowest exposure that still gives stable detection under venue lighting. Start with a stationary tag, then test while moving.",
    pros: "Lower exposure reduces motion blur; higher exposure brightens a dark image.",
    cons: "Motion blur is the smear created while the robot, camera, or tag moves during an exposure. It softens the square's corners and cell edges, so the detector may miss the tag or return a less stable pose. Too little exposure can instead make the image too dark.",
  },
  black: {
    recommendation: "Start at 0 for unlit black-and-white AprilTags and change it only after inspecting the image.",
    pros: "A carefully raised cutoff can suppress a dim background in some vision tasks.",
    cons: "It can erase dark tag detail and reduce black/white contrast; values used for illuminated tape may be poor for AprilTags.",
  },
  gain: {
    recommendation: "Keep gain as low as practical. Set exposure for acceptable motion blur first, then add only enough gain to recover contrast.",
    pros: "Gain brightens the signal without lengthening exposure time.",
    cons: "It also amplifies sensor noise and cannot restore detail already blurred or clipped.",
  },
  flicker: {
    recommendation: "Start Off. If the preview shows moving bright and dark bands, select the frequency that matches the flicker of the venue's light sources—commonly 60 Hz in North America—and verify it on site.",
    pros: "A matching setting can reduce brightness bands caused by powered lighting.",
    cons: "The wrong frequency may not help, and LED drivers do not always follow the local mains frequency.",
    choices: [
      { option: "Off", useWhen: "The image has no visible flicker bands", tradeoff: "Avoids unnecessary capture constraints." },
      { option: "50 Hz", useWhen: "The venue lighting actually flickers near 50 Hz", tradeoff: "Do not copy this from the reference screenshot without testing." },
      { option: "60 Hz", useWhen: "The venue lighting actually flickers near 60 Hz", tradeoff: "Often relevant in North America, but the real fixture must be tested." },
    ],
  },
  balance: {
    recommendation: "Start with the Limelight defaults. Adjust red and blue only when the preview has a strong color cast and detection testing shows a benefit.",
    pros: "White balance can make image brightness and contrast more consistent under unusual lighting.",
    cons: "Extreme values can clip channels or reduce contrast. It does not calibrate the lens or correct pose geometry.",
  },
  family: {
    recommendation: "Select AprilTag Classic 36h11 for standard FTC AprilTags. The family must match the printed tag.",
    pros: "Using the correct family lets the decoder interpret the tag's cell pattern and ID.",
    cons: "The wrong family rejects every tag even when the image, exposure, and physical setup look correct.",
    choices: [
      { option: "36h11", useWhen: "Using standard FTC AprilTags", tradeoff: "Correct workshop setting; it will not decode tags printed from another family." },
      { option: "25h9", useWhen: "Only when your physical tags were deliberately generated in that family", tradeoff: "Not the standard family used by this FTC workshop." },
    ],
  },
  size: {
    recommendation: "Measure the outside width of the black border and enter that value in millimeters. This practice lab uses 50.8 mm only as an example.",
    pros: "Correct size gives pose estimation the physical scale needed for a meaningful range.",
    cons: "An incorrect value can still produce a valid-looking detection while scaling the reported translation and range incorrectly.",
  },
  downscale: {
    recommendation: "Start at 2×, then test the farthest required distance. Increase the factor when you need more FPS; reduce it when distant tags are missed.",
    pros: "A larger downscale factor gives the detector fewer pixels to search, which can significantly increase pipeline frame rate.",
    cons: "The tag becomes smaller in the detector image, reducing effective detection range. Limelight states that downscale does not itself reduce 3D accuracy, stability, or decoding accuracy after a tag is successfully detected.",
    choices: [
      { option: "1×", useWhen: "Maximum detection range matters more than processing speed", tradeoff: "Processes the most pixels and normally has the lowest FPS." },
      { option: "2×", useWhen: "Choosing a balanced starting point", tradeoff: "Faster than 1× with some loss of effective range." },
      { option: "3×–4×", useWhen: "Tags are large/near and faster pipeline updates matter", tradeoff: "Highest modeled FPS, but distant or small tags may disappear first." },
    ],
  },
  quality: {
    recommendation: "Begin with the installed LimelightOS default. Change it only after checking the exact meaning and direction shown by that OS version, then test both real tags and clutter.",
    pros: "A suitable threshold can reject weak candidates and reduce false detections.",
    cons: "A stricter threshold can also reject real tags, especially when they are small, blurred, partly covered, or poorly lit. A looser value can admit more false positives.",
    choices: [
      { option: "Installed default", useWhen: "Beginning setup or when the OS version is unknown", tradeoff: "Safest baseline for comparing other settings." },
      { option: "Stricter", useWhen: "Verified false positives remain after family, image, and ID-filter checks", tradeoff: "May create more missed detections; verify which numeric direction is stricter in your installed UI." },
      { option: "Looser", useWhen: "Real tags are being rejected despite a usable image", tradeoff: "May accept weak or incorrect candidates; verify which numeric direction is looser in your installed UI." },
    ],
  },
  filter: {
    recommendation: "Enter only the tag IDs the current robot task should accept—for example, 20. Leave it blank only when every ID is intentionally eligible.",
    pros: "Filtering prevents unrelated visible tags from becoming the pipeline's selected/base target and can eliminate many false positives.",
    cons: "A correct tag that is missing from the list remains excluded even though it is plainly visible in the stream.",
  },
  crop: {
    recommendation: "Start with the full image. Crop only after confirming where valid targets can appear throughout the robot's complete motion.",
    pros: "Removing irrelevant image regions can provide a large processing-speed improvement.",
    cons: "Any tag outside the crop is invisible to the detector. A crop that works while stationary may fail after the robot turns, pitches, or approaches.",
  },
  sort: {
    recommendation: "Use Selected when controlling toward a specific ID. Use Largest only when the largest visible eligible tag is intentionally the target.",
    pros: "A deliberate selection rule makes the base tx/ty crosshair predictable when several tags are visible.",
    cons: "Largest, Highest, Lowest, and Group center can describe a different tag or a synthetic group point instead of the tag your code intended.",
    choices: [
      { option: "Selected", useWhen: "The robot must act on one chosen tag", tradeoff: "Requires a correct selected ID and a fallback when it is absent." },
      { option: "Largest", useWhen: "The nearest/largest eligible image target is acceptable", tradeoff: "The active target can switch as apparent areas change." },
      { option: "Highest / Lowest", useWhen: "Image position is the intended selection rule", tradeoff: "Perspective and robot motion can change which tag wins." },
      { option: "Group center", useWhen: "Aiming between several targets is intentional", tradeoff: "The result is a combined image point, not an individual tag ID or pose." },
    ],
  },
};
