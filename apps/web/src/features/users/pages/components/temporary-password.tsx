import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TemporaryPasswordProps {
  title: string;
  description: string;
  password: string;
  onClose: () => void;
}

export default function TemporaryPassword({
  title,
  description,
  password,
  onClose,
}: TemporaryPasswordProps) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      inputRef.current?.select();
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-2 rounded-lg border border-warning/40 bg-warning/10 p-4">
        <Label htmlFor="temporaryPassword" className="text-warning">
          Contraseña temporal · se muestra una sola vez
        </Label>
        <div className="flex gap-2">
          <Input
            id="temporaryPassword"
            ref={inputRef}
            value={password}
            readOnly
            className="font-mono tracking-wide"
            onFocus={(event) => event.currentTarget.select()}
          />
          <Button type="button" variant="outline" onClick={copyPassword}>
            {copied ? <Check /> : <Copy />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          La persona deberá cambiarla en su próximo inicio de sesión.
        </p>
      </div>
      <DialogFooter>
        <Button type="button" onClick={onClose}>
          Listo
        </Button>
      </DialogFooter>
    </>
  );
}
