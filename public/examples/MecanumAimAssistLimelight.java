package org.firstinspires.ftc.teamcode;

import com.qualcomm.hardware.limelightvision.LLResult;
import com.qualcomm.hardware.limelightvision.LLResultTypes;
import com.qualcomm.hardware.limelightvision.Limelight3A;
import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.hardware.DcMotor;

@TeleOp(name = "Mecanum Aim Assist (Limelight)", group = "Vision")
public class MecanumAimAssistLimelight extends LinearOpMode {
    private DcMotor leftFront, leftBack, rightFront, rightBack;
    private Limelight3A limelight;

    private static final int BLUE_GOAL_ID = 20;
    private static final int RED_GOAL_ID = 24;
    private static final double TURN_GAIN = 0.020;
    private static final double MAX_ASSIST_TURN = 0.20;
    private static final double DRIVER_TURN_DEADZONE = 0.25;
    private static final double TX_TOLERANCE_DEG = 1.0;

    private boolean assistEnabled;
    private boolean previousA;
    private double desiredTxDeg;

    @Override
    public void runOpMode() {
        initDrive();
        limelight = hardwareMap.get(Limelight3A.class, "limelight");
        limelight.setPollRateHz(30);
        limelight.pipelineSwitch(0);
        limelight.start();

        telemetry.addLine("Ready. A toggles aim assist.");
        telemetry.update();
        waitForStart();

        try {
            while (opModeIsActive()) {
                updateAssistToggle();

                double drive = -gamepad1.left_stick_y;
                double strafe = gamepad1.left_stick_x;
                double driverTurn = gamepad1.right_stick_x;
                double assistTurn = calculateAssistTurn(driverTurn);
                double finalTurn = clip(driverTurn + assistTurn, -1.0, 1.0);

                driveMecanum(drive, strafe, finalTurn);
                telemetry.addData("Assist enabled", assistEnabled);
                telemetry.addData("Driver turn", "%.2f", driverTurn);
                telemetry.addData("Assist turn", "%.2f", assistTurn);
                telemetry.addData("Final turn", "%.2f", finalTurn);
                telemetry.update();
            }
        } finally {
            stopDrive();
            limelight.stop();
        }
    }

    private double calculateAssistTurn(double driverTurn) {
        if (!assistEnabled || Math.abs(driverTurn) > DRIVER_TURN_DEADZONE) return 0.0;

        LLResult result = limelight.getLatestResult();
        if (result == null || !result.isValid()) return 0.0;

        LLResultTypes.FiducialResult target = null;
        for (LLResultTypes.FiducialResult tag : result.getFiducialResults()) {
            if (tag.getFiducialId() == BLUE_GOAL_ID || tag.getFiducialId() == RED_GOAL_ID) {
                target = tag;
                break;
            }
        }
        if (target == null) return 0.0;

        double tx = target.getTargetXDegrees();
        double error = tx - desiredTxDeg;
        telemetry.addData("Target ID", target.getFiducialId());
        telemetry.addData("tx error (deg)", "%.1f", error);

        if (Math.abs(error) <= TX_TOLERANCE_DEG) return 0.0;
        return clip(error * TURN_GAIN, -MAX_ASSIST_TURN, MAX_ASSIST_TURN);
    }

    private void updateAssistToggle() {
        boolean currentA = gamepad1.a;
        if (currentA && !previousA) assistEnabled = !assistEnabled;
        previousA = currentA;
    }

    private void initDrive() {
        leftFront = hardwareMap.get(DcMotor.class, "left_front_drive");
        leftBack = hardwareMap.get(DcMotor.class, "left_back_drive");
        rightFront = hardwareMap.get(DcMotor.class, "right_front_drive");
        rightBack = hardwareMap.get(DcMotor.class, "right_back_drive");

        leftFront.setDirection(DcMotor.Direction.REVERSE);
        leftBack.setDirection(DcMotor.Direction.REVERSE);
        for (DcMotor motor : new DcMotor[]{leftFront, leftBack, rightFront, rightBack}) {
            motor.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
        }
    }

    private void driveMecanum(double drive, double strafe, double turn) {
        double lf = drive + strafe + turn;
        double lb = drive - strafe + turn;
        double rf = drive - strafe - turn;
        double rb = drive + strafe - turn;
        double scale = Math.max(1.0, Math.max(Math.abs(lf), Math.max(Math.abs(lb),
                Math.max(Math.abs(rf), Math.abs(rb)))));

        leftFront.setPower(lf / scale);
        leftBack.setPower(lb / scale);
        rightFront.setPower(rf / scale);
        rightBack.setPower(rb / scale);
    }

    private void stopDrive() {
        leftFront.setPower(0);
        leftBack.setPower(0);
        rightFront.setPower(0);
        rightBack.setPower(0);
    }

    private double clip(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }
}
