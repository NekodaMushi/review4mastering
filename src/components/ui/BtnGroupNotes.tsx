"use client";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

export function ButtonGroupDemo() {
  return (
    <ButtonGroup>
      <Button variant="outline" size="icon" aria-label="Go Back">
        <ArrowLeftIcon />
      </Button>
      <Button variant="outline">Archive</Button>
      <Button variant="outline">Report</Button>
    </ButtonGroup>
  );
}
