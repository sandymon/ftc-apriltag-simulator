package org.firstinspires.ftc.teamcode;

import com.qualcomm.hardware.limelightvision.LLResult;
import com.qualcomm.hardware.limelightvision.LLResultTypes;
import com.qualcomm.hardware.limelightvision.Limelight3A;
import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

// Original workshop example. Configure an AprilTag pipeline in slot 0.
// Validate against your SDK and hardware before use on a robot.
@TeleOp(name = "AprilTag Lab - Limelight")
public class LimelightWorkshop extends LinearOpMode {
    @Override public void runOpMode() {
        Limelight3A limelight = hardwareMap.get(
                Limelight3A.class, "limelight");
        try {
            limelight.setPollRateHz(100);
            telemetry.setMsTransmissionInterval(100);
            limelight.pipelineSwitch(0);
            limelight.start();
            waitForStart();

            while (opModeIsActive()) {
                LLResult result = limelight.getLatestResult();
                // 100 ms is an example received-result age limit.
                // getStaleness() does NOT measure full camera frame age.
                if (result != null && result.isValid()
                        && result.getPipelineIndex() == 0
                        && result.getStaleness() < 100) {
                    telemetry.addData("Primary tx (degrees)", result.getTx());
                    telemetry.addData("Primary ty (degrees)", result.getTy());
                    telemetry.addData("Area (%)", result.getTa());
                    telemetry.addData("Capture latency (ms)",
                            result.getCaptureLatency());
                    telemetry.addData("Pipeline latency (ms)",
                            result.getTargetingLatency());
                    for (LLResultTypes.FiducialResult tag
                            : result.getFiducialResults()) {
                        telemetry.addData("Tag " + tag.getFiducialId(),
                                "txNC %.1f degrees",
                                tag.getTargetXDegreesNoCrosshair());
                    }
                } else {
                    telemetry.addLine("No eligible result on pipeline 0");
                }
                telemetry.update();
                sleep(20);
            }
        } finally {
            limelight.stop();
        }
    }
}
