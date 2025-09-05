import React, { useEffect, useMemo, useRef, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, Phone, Video, HeartHandshake, User, Settings, DollarSign, Filter, Send, Mic, MicOff, Camera, CameraOff } from "lucide-react";
import { motion } from "framer-motion";

/**
 * SciConnect — Single-file MVP prototype
 * - Navigation: Scientists, Chat, Call, Donate, Profile
 * - Personality-based filtering (very simple demo)
 * - Chat UI (local, mock; ready to wire to Socket.IO / Firebase)
 * - Audio/Video call preview using getUserMedia (WebRTC placeholder)
 * - PayPal donations with @paypal/react-paypal-js (Sandbox-ready w/ client-id: "test")
 *
 * Notes:
 * 1) This is a front-end prototype. For production you will add a backend (e.g. Node/NestJS or Python/FastAPI)
 *    to handle auth, scientist availability, matching, chat history, and call signaling.
 * 2) Replace the PayPal client ID with your real sandbox/client ID.
 * 3) Wire chat to Socket.IO or Firestore; wire WebRTC via a signaling server.
 */

const scientistsSeed = [
  {
    id: "s1",
    name: "Dr. Amina Patel",
    field: "Astrophysics",
    personality: "INTJ",
    bio: "Researches exoplanet atmospheres and biosignatures.",
    avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=300&auto=format&fit=crop",
    causes: ["Girls in STEM", "Space Education"],
  },
  {
    id: "s2",
    name: "Prof. Luca Romano",
    field: "Neuroscience",
    personality: "ENFP",
    bio: "Studies memory consolidation and learning.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop",
    causes: ["Neurodiversity", "Open Science"],
  },
  {
    id: "s3",
    name: "Dr. Mei Lin",
    field: "Climate Science",
    personality: "INFJ",
    bio: "Models regional climate adaptation strategies.",
    avatar: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=300&auto=format&fit=crop",
    causes: ["Reforestation", "Clean Water"],
  },
  {
    id: "s4",
    name: "Dr. Kwame Mensah",
    field: "Biotech",
    personality: "ENTP",
    bio: "Develops low-cost point-of-care diagnostics.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop",
    causes: ["Global Health", "Lab Access"],
  },
];

const causesSeed = [
  { id: "c1", name: "Girls in STEM", description: "Scholarships and mentorship for girls in science.", impact: "$25 buys 1hr mentorship" },
  { id: "c2", name: "Space Education", description: "Hands-on astronomy kits for classrooms.", impact: "$50 funds a star party" },
  { id: "c3", name: "Neurodiversity", description: "Support inclusive learning tools.", impact: "$20 funds accessibility tools" },
  { id: "c4", name: "Open Science", description: "Grants to open-source research software.", impact: "$30 sponsors compute time" },
  { id: "c5", name: "Reforestation", description: "Tree-planting in climate-vulnerable regions.", impact: "$10 plants 5 trees" },
  { id: "c6", name: "Clean Water", description: "Affordable water purification kits.", impact: "$40 funds 1 family/month" },
  { id: "c7", name: "Global Health", description: "Diagnostics for remote clinics.", impact: "$35 equips 1 kit" },
  { id: "c8", name: "Lab Access", description: "Microgrants for community labs.", impact: "$15 buys lab consumables" },
];

function Header({ active, setActive }) {
  const items = [
    { id: "scientists", label: "Scientists", icon: <Search className="h-4 w-4" /> },
    { id: "chat", label: "Chat", icon: <MessageSquare className="h-4 w-4" /> },
    { id: "call", label: "Call", icon: <Phone className="h-4 w-4" /> },
    { id: "video", label: "Video", icon: <Video className="h-4 w-4" /> },
    { id: "donate", label: "Donate", icon: <HeartHandshake className="h-4 w-4" /> },
    { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
  ];

  return (
    <div className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          <span className="font-semibold">SciConnect</span>
        </div>
        <div className="flex gap-2">
          {items.map((it) => (
            <Button
              key={it.id}
              onClick={() => setActive(it.id)}
              variant={active === it.id ? "default" : "outline"}
              className="rounded-2xl"
            >
              <div className="flex items-center gap-2">{it.icon}<span>{it.label}</span></div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScientistCard({ s, onChat }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={s.avatar} />
            <AvatarFallback>{s.name.split(" ").map(n=>n[0]).join("")}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{s.name}</CardTitle>
            <div className="text-sm text-muted-foreground">{s.field} • {s.personality}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm mb-3">{s.bio}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {s.causes.map(c => <Badge key={c} variant="secondary" className="rounded-xl">{c}</Badge>)}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onChat(s)} className="rounded-2xl"><MessageSquare className="h-4 w-4 mr-2"/>Chat</Button>
          <Button variant="outline" className="rounded-2xl"><Phone className="h-4 w-4 mr-2"/>Call</Button>
          <Button variant="outline" className="rounded-2xl"><Video className="h-4 w-4 mr-2"/>Video</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ScientistsPage({ onStartChat }) {
  const [query, setQuery] = useState("");
  const [ptype, setPtype] = useState("ALL");

  const filtered = useMemo(() => {
    return scientistsSeed.filter(s =>
      (ptype === "ALL" || s.personality === ptype) &&
      (s.name.toLowerCase().includes(query.toLowerCase()) ||
       s.field.toLowerCase().includes(query.toLowerCase()) ||
       s.bio.toLowerCase().includes(query.toLowerCase()))
    );
  }, [query, ptype]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid gap-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"/>
          <Input className="pl-9 rounded-2xl w-72" placeholder="Search scientists or topics" value={query} onChange={e=>setQuery(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4"/>
          <Select value={ptype} onValueChange={setPtype}>
            <SelectTrigger className="w-[180px] rounded-2xl"><SelectValue placeholder="Personality"/></SelectTrigger>
            <SelectContent>
              {"ALL INTJ INFJ INTP ENTP ENFP ENTJ ISTJ ISFJ".split(" ").map(x => (
                <SelectItem key={x} value={x}>{x}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => (
          <motion.div key={s.id} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.2}}>
            <ScientistCard s={s} onChat={onStartChat} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ChatPage({ thread, onSend, currentScientist }) {
  const [msg, setMsg] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 grid gap-3 h-[calc(100vh-140px)]">
      <Card className="rounded-2xl flex-1 overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            {currentScientist ? (
              <>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentScientist.avatar}/>
                  <AvatarFallback>{currentScientist.name.split(" ").map(n=>n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{currentScientist.name}</CardTitle>
                  <div className="text-xs text-muted-foreground">{currentScientist.field} • {currentScientist.personality}</div>
                </div>
              </>
            ) : (
              <CardTitle className="text-base">General Chat</CardTitle>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 space-y-3 h-[50vh] overflow-y-auto bg-muted/30">
            {thread.map((m, idx) => (
              <div key={idx} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`px-3 py-2 rounded-2xl max-w-[70%] text-sm ${m.from === "me" ? "bg-primary text-primary-foreground" : "bg-white border"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="p-3 border-t flex items-center gap-2">
            <Textarea value={msg} onChange={e=>setMsg(e.target.value)} className="rounded-2xl" placeholder="Type your message..." />
            <Button className="rounded-2xl" onClick={() => { if(msg.trim()){ onSend(msg.trim()); setMsg(""); } }}>
              <Send className="h-4 w-4 mr-2"/>Send
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="text-xs text-muted-foreground">
        This is a local mock. In production, wire to Socket.IO/Firebase and persist messages per user-thread.
      </div>
    </div>
  );
}

function AVToggle({ label, on, onToggle, IconOn, IconOff }){
  return (
    <Button variant={on ? "default" : "outline"} onClick={onToggle} className="rounded-2xl">
      {on ? <IconOn className="h-4 w-4 mr-2"/> : <IconOff className="h-4 w-4 mr-2"/>}
      {label}
    </Button>
  );
}

function CallPage({ kind = "audio" }){
  const videoRef = useRef(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(kind === "video");
  const streamRef = useRef(null);

  useEffect(() => {
    // Get user media preview (no peer connection here — signaling to be added later)
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: kind === "video" });
        streamRef.current = stream;
        if (videoRef.current && kind === "video") {
          videoRef.current.srcObject = stream;
        }
      } catch (e) {
        console.error(e);
      }
    };
    getMedia();
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [kind]);

  useEffect(() => {
    if (!streamRef.current) return;
    streamRef.current.getAudioTracks().forEach(t => t.enabled = micOn);
    if (kind === "video") streamRef.current.getVideoTracks().forEach(t => t.enabled = camOn);
  }, [micOn, camOn, kind]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 grid gap-4">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">{kind === "video" ? "Video" : "Audio"} Call (preview)</CardTitle>
        </CardHeader>
        <CardContent>
          {kind === "video" ? (
            <div className="rounded-2xl overflow-hidden border aspect-video bg-black">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <div className="text-muted-foreground">Microphone level (preview only)</div>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <AVToggle label="Mic" on={micOn} onToggle={()=>setMicOn(v=>!v)} IconOn={Mic} IconOff={MicOff} />
            {kind === "video" && (
              <AVToggle label="Camera" on={camOn} onToggle={()=>setCamOn(v=>!v)} IconOn={Camera} IconOff={CameraOff} />
            )}
            <Button variant="destructive" className="rounded-2xl">End</Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2">This demo shows local device media only. Add WebRTC + a signaling server (WebSocket/Socket.IO) to connect two peers.</div>
        </CardContent>
      </Card>
    </div>
  );
}

function DonatePage(){
  const [selectedCause, setSelectedCause] = useState("c1");
  const [amount, setAmount] = useState("25");
  const cause = useMemo(() => causesSeed.find(c=>c.id===selectedCause), [selectedCause]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 grid gap-4">
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Donate</CardTitle>
              <div className="text-sm text-muted-foreground">Choose a cause and complete a secure donation via PayPal.</div>
            </div>
            <Badge variant="secondary" className="rounded-xl">Sandbox</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedCause} onValueChange={setSelectedCause}>
              <SelectTrigger className="w-[220px] rounded-2xl"><SelectValue placeholder="Select cause"/></SelectTrigger>
              <SelectContent>
                {causesSeed.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input className="w-32 rounded-2xl" type="number" min={1} step={1} value={amount} onChange={e=>setAmount(e.target.value)} />
          </div>
          <div className="text-sm">
            <div className="font-medium">{cause?.name}</div>
            <div className="text-muted-foreground">{cause?.description} • <span className="italic">{cause?.impact}</span></div>
          </div>

          <PayPalScriptProvider options={{ "client-id": "test", currency: "USD", components: "buttons" }}>
            <div className="border rounded-2xl p-4">
              <PayPalButtons
                style={{ layout: "vertical" }}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [{ amount: { value: String(Math.max(1, Number(amount)||1)) }, description: `Donation to ${cause?.name}` }],
                    application_context: { shipping_preference: "NO_SHIPPING" },
                  });
                }}
                onApprove={async (data, actions) => {
                  try {
                    const details = await actions.order.capture();
                    alert(`Thank you! Donation complete: ${details.id}`);
                  } catch (e) {
                    alert("Capture failed. Check console.");
                    console.error(e);
                  }
                }}
                onError={(err)=>{
                  console.error(err);
                  alert("PayPal error. See console for details.");
                }}
              />
            </div>
          </PayPalScriptProvider>

          <div className="text-xs text-muted-foreground">
            Replace client-id "test" with your PayPal Sandbox client ID. For production, use your live client ID and enable HTTPS.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfilePage(){
  const [name, setName] = useState("Alex");
  const [ptype, setPtype] = useState("ENFP");
  const [interests, setInterests] = useState("space, climate, biotech");

  return (
    <div className="max-w-xl mx-auto px-4 py-6 grid gap-4">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-1">
            <div className="text-sm">Display name</div>
            <Input value={name} onChange={e=>setName(e.target.value)} className="rounded-2xl"/>
          </div>
          <div className="grid gap-1">
            <div className="text-sm">Personality type</div>
            <Select value={ptype} onValueChange={setPtype}>
              <SelectTrigger className="rounded-2xl"><SelectValue/></SelectTrigger>
              <SelectContent>
                {"INTJ INFJ INTP ENTP ENFP ENTJ ISTJ ISFJ".split(" ").map(x => (
                  <SelectItem key={x} value={x}>{x}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <div className="text-sm">Interests</div>
            <Input value={interests} onChange={e=>setInterests(e.target.value)} className="rounded-2xl"/>
          </div>
          <div className="flex gap-2">
            <Button className="rounded-2xl">Save</Button>
            <Button variant="outline" className="rounded-2xl"><Settings className="h-4 w-4 mr-2"/>Preferences</Button>
          </div>
          <div className="text-xs text-muted-foreground">Persist these fields to your backend user profile. Use them for matching and discovery.</div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App(){
  const [active, setActive] = useState("scientists");
  const [currentScientist, setCurrentScientist] = useState(null);
  const [thread, setThread] = useState([
    { from: "sci", text: "Hi! I'm here to answer your questions about science." },
  ]);

  const handleStartChat = (s) => {
    setCurrentScientist(s);
    setActive("chat");
  };

  const handleSend = (text) => {
    setThread(prev => [...prev, { from: "me", text }]);
    // MOCK auto-reply — replace with real bot or scientist message
    setTimeout(() => {
      setThread(prev => [...prev, { from: "sci", text: "Thanks! I'll get back to you shortly." }]);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header active={active} setActive={setActive} />
      <main>
        {active === "scientists" && <ScientistsPage onStartChat={handleStartChat} />}
        {active === "chat" && <ChatPage thread={thread} onSend={handleSend} currentScientist={currentScientist} />}
        {active === "call" && <CallPage kind="audio" />}
        {active === "video" && <CallPage kind="video" />}
        {active === "donate" && <DonatePage />}
        {active === "profile" && <ProfilePage />}
      </main>
      <footer className="py-8 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} SciConnect • Demo prototype</footer>
    </div>
  );
}
