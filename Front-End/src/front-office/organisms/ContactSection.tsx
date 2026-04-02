import { Mail, Phone, MapPin } from "lucide-react";

export function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Besoin d'aide ou de plus d'informations ?
            </h2>
            <p className="text-slate-300 mb-8 text-lg">
              Notre équipe est là pour répondre à toutes vos questions et vous accompagner 
              dans la transformation digitale de votre entreprise.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-400 shrink-0 mt-1" />
                <div>
                  <div className="font-medium">Email</div>
                  <a href="mailto:contact@bizmanager.tn" className="text-slate-300 hover:text-white">
                    contact@bizmanager.tn
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-blue-400 shrink-0 mt-1" />
                <div>
                  <div className="font-medium">Téléphone</div>
                  <a href="tel:+21671234567" className="text-slate-300 hover:text-white">
                    +216 71 234 567
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-400 shrink-0 mt-1" />
                <div>
                  <div className="font-medium">Adresse</div>
                  <div className="text-slate-300">
                    Centre Urbain Nord, 1082 Tunis<br />
                    Tunisie
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 p-8 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4">Horaires d'ouverture</h3>
            <div className="space-y-3 text-slate-300">
              <div className="flex justify-between">
                <span>Lundi - Vendredi</span>
                <span className="text-white">8:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span>Samedi</span>
                <span className="text-white">9:00 - 13:00</span>
              </div>
              <div className="flex justify-between">
                <span>Dimanche</span>
                <span className="text-white">Fermé</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
