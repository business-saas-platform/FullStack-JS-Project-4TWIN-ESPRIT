import { Rocket, Sparkles, WalletCards } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui";

type FirstLoginOnboardingProps = {
  open: boolean;
  onClose: () => void;
  userName?: string;
};

export function FirstLoginOnboarding({
  open,
  onClose,
  userName,
}: FirstLoginOnboardingProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Bienvenue{userName ? ` ${userName}` : ""} sur la plateforme
          </DialogTitle>
          <DialogDescription>
            Voici un mini guide de demarrage pour profiter de toutes les
            fonctionnalites des la premiere connexion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-border p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Rocket className="h-4 w-4 text-indigo-600" />
              1) Configure ton entreprise
            </div>
            <p className="text-sm text-muted-foreground">
              Commence par verifier les infos de societe, devise, fiscalite et
              preferences dans les parametres.
            </p>
          </div>

          <div className="rounded-xl border border-border p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <WalletCards className="h-4 w-4 text-indigo-600" />
              2) Lance tes flux metier
            </div>
            <p className="text-sm text-muted-foreground">
              Cree tes premieres factures, ajoute des depenses et active la
              gestion clients pour centraliser ton activite.
            </p>
          </div>

          <div className="rounded-xl border border-border p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              3) Explore les modules IA
            </div>
            <p className="text-sm text-muted-foreground">
              Utilise AI Insights, Coach et les previsions pour accelerer tes
              decisions et automatiser l'analyse.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button className="w-full sm:w-auto" onClick={onClose}>
            Commencer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
