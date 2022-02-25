import { Syringe, Upload } from "phosphor-react";
import { Stepper, Button, Group } from "@mantine/core";
import { useState } from "react";
const DashboardEmployeeVaccine = () => {
  const [active, setActive] = useState(1);
  const nextStep = () =>
    setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  return (
    <div className="mx-6 my-2">
      <div className="flex flex-row space-x-2 items-center">
        <h1 className="capitalize font-fraunces text-2xl">
          vaccine certificates
        </h1>
        <Syringe size={30} className="text-red-500" />
      </div>
      <div>
        <Stepper
          active={active}
          onStepClick={setActive}
          breakpoint="sm"
          orientation="vertical"
        >
          <Stepper.Step label="Vaccine 1" description="verified">
            <div className="flex flex-row space-x-2 items-center">
              <p>Certificate 1</p>
              <Button radius="lg" rightIcon={<Upload size={20} />}>
                Upload
              </Button>
            </div>
          </Stepper.Step>
          <Stepper.Step label="Second step" description="Verify email">
            <div className="flex flex-row space-x-2 items-center">
              <p>Certificate 1</p>
              <Button radius="lg" rightIcon={<Upload size={20} />}>
                Upload
              </Button>
            </div>
          </Stepper.Step>
          <Stepper.Step label="Final step" description="Get full access">
            <div className="flex flex-row space-x-2 items-center">
              <p>Certificate 1</p>
              <Button radius="lg" rightIcon={<Upload size={20} />}>
                Upload
              </Button>
            </div>
          </Stepper.Step>
          <Stepper.Completed>
            Completed, click back button to get to previous step
          </Stepper.Completed>
        </Stepper>
      </div>
    </div>
  );
};

export default DashboardEmployeeVaccine;
