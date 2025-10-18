import { useState } from "react";
import { Users, Mail, UserPlus } from "lucide-react";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import aditya from "@/assets/aditya.jpeg";
import devashish from "@/assets/devashish.jpeg";
import mohit from "@/assets/Mohit.png";
import shivam from "@/assets/shivam.jpeg";
import vaibhav from "@/assets/vaibhav.jpeg";
import abhishek from "@/assets/abhishek.png";
import sunil from "@/assets/sunil.jpeg";
import suryans from "@/assets/suryans.jpeg";
import arkaprovo from "@/assets/arko.jpeg";
import chirag from "@/assets/chirag.jpeg";
import praveen from "@/assets/praveen.jpeg";
import vivek from "@/assets/vivek.png";
import ronit from "@/assets/ronit.jpg";
import harendra from "@/assets/harendra.png";
import satyam from "@/assets/satyam.png";
import lakshay from "@/assets/lakshay.jpg";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

const Members = () => {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const members = [
    { name: "Shivam Kumar", role: "President", initials: "SK", images: shivam },
    { name: "Vivek Kumar", role: "General Secretary", initials: "VK", images: vivek },
    { name: "Vaibhav Raj", role: "Vice President",  initials: "VR" , images:vaibhav},
    { name: "Arkaprovo Mukherjee", role: "Assistent General Seceratary",  initials: "AM" , images:arkaprovo},
    { name: "Devashish Gupta", role: "Joint Seceratary", initials: "DG", images: devashish},
    { name: "Sunil Kushwaha", role: "Head Event Managment", initials: "SK", images:sunil },
    { name: "Suryans Singh", role: "Co-head Event Managment",  initials: "SS", images: suryans},
    { name: "Ronit Raj", role: "PR Head",  initials: "RR", images: ronit},
    { name: "Mohit Kumar Lalwani", role: "Tech Lead", initials: "ML" , images:mohit},
    { name: "Abhishek Kumar", role: "Marketing Lead",  initials: "AK", images: abhishek },
    { name: "Lakshay Ujjwal", role: "Content Head",  initials: "AG", images: lakshay },
    { name: "Aditya Gupta", role: "Social Media Lead",  initials: "AG", images: aditya },
    { name: "Chirag Khandelwal", role: "Executive Member",  initials: "CK", images: chirag },
    { name: "Harendra Nagar", role: "Executive Member",  initials: "HN", images: harendra },
    { name: "Praveen Goyal", role: "Executive Member",  initials: "PG", images: praveen },
    { name: "Satyam Kumar Jha", role: "Executive Member",  initials: "SKJ", images: satyam},
  ];

  const getRoleColor = (role: string) => {
    if(role.includes("Vice President")) return "bg-secondary/20 text-secondary border-secondary/50";
    if (role.includes("Executive")) return "bg-primary/20 text-primary border-primary/50";
    if ((role.includes("President"))||(role.includes("General Secretary"))) return "bg-accent/20 text-accent border-accent/50";
    return "bg-secondary/20 text-secondary border-secondary/50";
  };

  const links = [
    { name: "Instagram", url: "https://www.instagram.com/nits.esports/", icon: <FaInstagram className="text-pink-500 w-5 h-5" />, hoverBg: "hover " },
    { name: "Facebook", url: "https://www.facebook.com/share/171mbHXcSh/", icon: <FaFacebookF className="text-blue-600 w-5 h-5" />, hoverBg: "hover" },
    { name: "WhatsApp", url: "https://chat.whatsapp.com/DAEBfNCeTy8FoLhxaQ5qN1?mode=ems_wa_t", icon: <FaWhatsapp className="text-green-500 w-5 h-5" />, hoverBg: "hover" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-5xl font-bold mb-4 text-gradient">
            Our Community
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Meet the passionate gamers who make our esports club thrive
          </p>
          <div>
            <Button
              size="lg"
              className="glow-primary font-orbitron group flex items-center"
              onClick={() => setIsJoinModalOpen(true)}
            >
              <UserPlus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Join Our Community
            </Button>
          </div>
        </div>

        {/* Core Team */}
        <section className="mb-12">
          <h2 className="font-orbitron text-3xl font-bold mb-8 flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Core Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {members.map((member, index) => (
              <Card
                key={index}
                className="glass-card border-primary/20 hover:border-primary/50 transition-all hover:glow-primary group"
              >
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <img src={member.images} alt={member.initials} className="h-28 w-28 rounded-full border-2 border-primary/50 group-hover:border-primary transition-colors"/>
                  </div>
                  <CardTitle className="font-orbitron text-lg">{member.name}</CardTitle>
                  <Badge variant="outline" className={`${getRoleColor(member.role)} flex justify-center`}>
                    {member.role}
                  </Badge>
                </CardHeader>
                <CardContent className="text-center space-y-2">
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Join CTA */}
        <Card className="glass-card border-primary/20 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-orbitron text-2xl font-bold mb-4">
              Want to Join Our Team?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We're always looking for passionate gamers to join our community. Whether you're a casual player or competitive pro, there's a place for you here.
            </p>
            <Button size="lg" className="font-orbitron glow-primary" onClick={() => setIsApplyModalOpen(true)}>
              Apply for Membership
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Community Join Modal */}
      <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Join Our Community</DialogTitle>
            <DialogClose className="absolute top-3 right-3 text-gray-500 hover:text-gray-800">
              ✕
            </DialogClose>
          </DialogHeader>
          <div className="flex flex-col mt-4 space-y-3">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center p-3 rounded-lg transition transform ${link.hoverBg} hover:scale-105`}
              >
                {link.icon}
                <span className="ml-3 font-medium">{link.name}</span>
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Apply for Membership Modal */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Apply for Membership</DialogTitle>
            <DialogClose className="absolute top-3 right-3 text-gray-500 hover:text-gray-800">
              ✕
            </DialogClose>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <p>Please send an email to <strong>esports.nits@gmail.com</strong> containing the following details:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Your Name</li>
              <li>Your Scholar ID</li>
              <li>Which team you want to join</li>
              <li>What are your skills</li>
              <li>Any prior experience</li>
            </ol>
            <div className="flex gap-2 mt-4">
              <a
                href={`mailto:esports.nits@gmail.com?subject=${encodeURIComponent("Membership Application")}&body=${encodeURIComponent("1. Your Name:%0D%0A2. Your Scholar ID:%0D%0A3. Which team you want to join:%0D%0A4. What are your skills:%0D%0A5. Any prior experience:%0D%0A")}`}
                className="w-full"
              >
                <Button className="w-full">Send Email</Button>
              </a>
              <DialogClose>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Members;