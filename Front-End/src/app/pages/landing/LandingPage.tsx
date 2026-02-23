import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";
import { 
  Building2, 
  FileText, 
  Receipt, 
  Users, 
  BarChart3, 
  Shield, 
  Sparkles, 
  Check,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

export function LandingPage() {
  const [formData, setFormData] = useState({
    businessName: "",
    fullName: "",
    email: "",
    phone: "",
    businessType: "",
    teamSize: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock form submission
    toast.success("Demande envoyée avec succès!", {
      description: "Notre équipe vous contactera sous 24 heures."
    });
    setFormData({
      businessName: "",
      fullName: "",
      email: "",
      phone: "",
      businessType: "",
      teamSize: "",
      message: ""
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-semibold">BizManager Pro</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Fonctionnalités</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors">Tarifs</a>
              <a href="#contact" className="text-slate-600 hover:text-slate-900 transition-colors">Contact</a>
              <Link to="/auth/login">
                <Button variant="ghost">Se connecter</Button>
              </Link>
              <a href="#signup">
                <Button>Commencer</Button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
                <Sparkles className="h-3 w-3 mr-1" />
                Plateforme SaaS Multitenant
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6">
                Gérez votre entreprise avec intelligence
              </h1>
              <p className="text-xl text-slate-600 mb-8">
                Une plateforme complète pour la facturation, la gestion des dépenses, le suivi client et la collaboration d'équipe. 
                Optimisée pour les entreprises tunisiennes avec conformité aux lois de souveraineté des données.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Commencer gratuitement
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <a href="#features">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Découvrir les fonctionnalités
                  </Button>
                </a>
              </div>
              <div className="mt-8 flex items-center gap-8">
                <div>
                  <div className="text-2xl font-bold text-slate-900">500+</div>
                  <div className="text-sm text-slate-600">Entreprises</div>
                </div>
                <div className="h-12 w-px bg-slate-200" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">99.9%</div>
                  <div className="text-sm text-slate-600">Disponibilité</div>
                </div>
                <div className="h-12 w-px bg-slate-200" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">24/7</div>
                  <div className="text-sm text-slate-600">Support</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-3xl opacity-20" />
              <Card className="relative">
                <CardHeader>
                  <CardTitle>Tableau de bord en temps réel</CardTitle>
                  <CardDescription>Visualisez vos métriques importantes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-600 mb-1">Revenus</div>
                      <div className="text-2xl font-bold text-blue-900">42,580 TND</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-600 mb-1">Factures</div>
                      <div className="text-2xl font-bold text-green-900">128</div>
                    </div>
                  </div>
                  <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-16 w-16 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4">Fonctionnalités</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Une suite complète d'outils pour gérer tous les aspects de votre entreprise
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Facturation intelligente</CardTitle>
                <CardDescription>
                  Créez, envoyez et suivez vos factures avec génération automatique de PDF. 
                  Gestion des paiements et relances automatiques.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-green-200 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Receipt className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Gestion des dépenses</CardTitle>
                <CardDescription>
                  Suivez toutes vos dépenses avec téléchargement de reçus, catégorisation automatique 
                  et rapports détaillés.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Gestion client CRM</CardTitle>
                <CardDescription>
                  Base de données clients complète avec historique des transactions, 
                  notes et communications centralisées.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-orange-200 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Rapports & Analytics</CardTitle>
                <CardDescription>
                  Tableaux de bord interactifs, rapports financiers détaillés et 
                  analyses prédictives pour optimiser votre croissance.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-indigo-200 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Sécurité & Conformité</CardTitle>
                <CardDescription>
                  Contrôle d'accès basé sur les rôles, chiffrement des données et 
                  conformité totale aux lois tunisiennes de souveraineté des données.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-pink-200 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle>Assistant IA intégré</CardTitle>
                <CardDescription>
                  Insights et recommandations intelligentes en temps réel pour 
                  optimiser vos décisions business et améliorer la performance.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4">Tarifs</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-4">
              Choisissez votre plan
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Des tarifs transparents et adaptés à la taille de votre entreprise
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>Pour les petites entreprises</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">49 TND</span>
                  <span className="text-slate-600">/mois</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>Jusqu'à 5 utilisateurs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>50 factures/mois</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>Gestion des dépenses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>100 clients</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>Rapports de base</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>Support email</span>
                  </li>
                </ul>
                <a href="#signup">
                  <Button className="w-full mt-6" variant="outline">
                    Commencer
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="border-2 border-blue-500 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500">
                Populaire
              </Badge>
              <CardHeader>
                <CardTitle>Professional</CardTitle>
                <CardDescription>Pour les entreprises en croissance</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">99 TND</span>
                  <span className="text-slate-600">/mois</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>Jusqu'à 20 utilisateurs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>Factures illimitées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>Gestion avancée des dépenses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>Clients illimités</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>Rapports & Analytics complets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>Assistant IA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>Support prioritaire 24/7</span>
                  </li>
                </ul>
                <a href="#signup">
                  <Button className="w-full mt-6">
                    Commencer
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>Pour les grandes organisations</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Sur mesure</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>Utilisateurs illimités</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>Factures illimitées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>Toutes les fonctionnalités</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>Multi-entreprises</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>Personnalisation complète</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>Intégrations API</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>Manager de compte dédié</span>
                  </li>
                </ul>
                <a href="#contact">
                  <Button className="w-full mt-6" variant="outline">
                    Nous contacter
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sign Up Form Section */}
      <section id="signup" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4">Commencer maintenant</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-4">
              Demandez une démo personnalisée
            </h2>
            <p className="text-xl text-slate-600">
              Remplissez le formulaire ci-dessous et notre équipe vous contactera sous 24 heures
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informations de votre entreprise</CardTitle>
              <CardDescription>
                Dites-nous en plus sur votre entreprise pour personnaliser votre expérience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Nom de l'entreprise *</Label>
                    <Input
                      id="businessName"
                      placeholder="Ex: SARL Innovation Tech"
                      value={formData.businessName}
                      onChange={(e) => handleChange("businessName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nom complet *</Label>
                    <Input
                      id="fullName"
                      placeholder="Ex: Mohamed Ben Ali"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email professionnel *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@entreprise.tn"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+216 XX XXX XXX"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Type d'entreprise *</Label>
                    <Select value={formData.businessType} onValueChange={(value) => handleChange("businessType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sarl">SARL</SelectItem>
                        <SelectItem value="suarl">SUARL</SelectItem>
                        <SelectItem value="sa">SA</SelectItem>
                        <SelectItem value="freelance">Freelance / Personne physique</SelectItem>
                        <SelectItem value="association">Association</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teamSize">Taille de l'équipe *</Label>
                    <Select value={formData.teamSize} onValueChange={(value) => handleChange("teamSize", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-5">1-5 employés</SelectItem>
                        <SelectItem value="6-20">6-20 employés</SelectItem>
                        <SelectItem value="21-50">21-50 employés</SelectItem>
                        <SelectItem value="51-100">51-100 employés</SelectItem>
                        <SelectItem value="100+">100+ employés</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message (optionnel)</Label>
                  <Textarea
                    id="message"
                    placeholder="Parlez-nous de vos besoins spécifiques..."
                    rows={4}
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                  />
                </div>

                <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <div className="font-medium mb-1">Conformité et sécurité</div>
                    <div className="text-blue-700">
                      Vos données sont hébergées en Tunisie et sont conformes aux lois tunisiennes de souveraineté des données. 
                      Nous ne partagerons jamais vos informations avec des tiers.
                    </div>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full">
                  Envoyer ma demande
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>

                <p className="text-sm text-center text-slate-600">
                  En soumettant ce formulaire, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
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
              <div className="mt-8 pt-8 border-t border-slate-700">
                <h3 className="text-xl font-semibold mb-4">Support client</h3>
                <p className="text-slate-300 mb-4">
                  Assistance technique disponible 24/7 pour les clients Professional et Enterprise
                </p>
                <Badge className="bg-green-600 hover:bg-green-600">
                  Support actif
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-6 w-6 text-blue-500" />
                <span className="text-white font-semibold">BizManager Pro</span>
              </div>
              <p className="text-sm">
                La plateforme SaaS complète pour gérer votre entreprise avec intelligence.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white">Tarifs</a></li>
                <li><a href="#" className="hover:text-white">Sécurité</a></li>
                <li><a href="#" className="hover:text-white">Mises à jour</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">À propos</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Carrières</a></li>
                <li><a href="#contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-white">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
                <li><a href="#" className="hover:text-white">Mentions légales</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-sm text-center">
            <p>© 2026 BizManager Pro. Tous droits réservés. Hébergé en Tunisie 🇹🇳</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
