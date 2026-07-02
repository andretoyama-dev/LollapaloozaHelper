/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Upload,
  ChevronRight,
  Info,
  UserCircle2,
  Settings,
  Plus,
  Trash2,
  X,
  Edit2,
  RotateCcw,
  AlertCircle,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

interface Show {
  palco: string;
  artista: string;
  inicio: string;
  fim: string;
}

interface ScheduleData {
  [key: string]: Show[];
}

type Selections = Record<string, Record<string, string[]>>; // FriendName -> Day -> Array of Artist Names

// --- Constants ---

const INITIAL_FRIENDS = ["André", "Massini", "Luquinha", "Bruno", "Mariana", "Sononcio", "Camille"];

const SCHEDULE: ScheduleData = {
  "Sexta - 20 Mar": [
    {"palco": "Budweiser", "artista": "Stefanie", "inicio": "12:45", "fim": "13:40"},
    {"palco": "Budweiser", "artista": "Negra Li", "inicio": "14:45", "fim": "15:45"},
    {"palco": "Budweiser", "artista": "Blood Orange", "inicio": "16:55", "fim": "17:55"},
    {"palco": "Budweiser", "artista": "Doechii", "inicio": "19:05", "fim": "20:05"},
    {"palco": "Budweiser", "artista": "Sabrina Carpenter", "inicio": "21:30", "fim": "23:00"},
    {"palco": "Samsung Galaxy", "artista": "89 FM", "inicio": "12:00", "fim": "12:45"},
    {"palco": "Samsung Galaxy", "artista": "Terraplana", "inicio": "13:40", "fim": "14:40"},
    {"palco": "Samsung Galaxy", "artista": "Viagra Boys", "inicio": "15:50", "fim": "16:50"},
    {"palco": "Samsung Galaxy", "artista": "Interpol", "inicio": "18:00", "fim": "19:00"},
    {"palco": "Samsung Galaxy", "artista": "Deftones", "inicio": "20:10", "fim": "21:25"},
    {"palco": "Flying Fish", "artista": "Worst", "inicio": "12:45", "fim": "13:40"},
    {"palco": "Flying Fish", "artista": "Scalene", "inicio": "14:45", "fim": "15:45"},
    {"palco": "Flying Fish", "artista": "Ruel", "inicio": "16:55", "fim": "17:55"},
    {"palco": "Flying Fish", "artista": "Men I Trust", "inicio": "19:05", "fim": "20:05"},
    {"palco": "Flying Fish", "artista": "Edson Gomes", "inicio": "21:30", "fim": "22:30"},
    {"palco": "Perry's by FIAT", "artista": "Camila Jun", "inicio": "12:00", "fim": "13:00"},
    {"palco": "Perry's by FIAT", "artista": "Bruna Strait", "inicio": "13:00", "fim": "14:00"},
    {"palco": "Perry's by FIAT", "artista": "Atkō", "inicio": "14:15", "fim": "15:15"},
    {"palco": "Perry's by FIAT", "artista": "Aline Rocha", "inicio": "15:30", "fim": "16:30"},
    {"palco": "Perry's by FIAT", "artista": "Horsegirl", "inicio": "16:45", "fim": "17:45"},
    {"palco": "Perry's by FIAT", "artista": "DJ Diesel (Shaq)", "inicio": "18:00", "fim": "19:00"},
    {"palco": "Perry's by FIAT", "artista": "Bunt.", "inicio": "19:15", "fim": "20:15"},
    {"palco": "Perry's by FIAT", "artista": "Ben Böhmer", "inicio": "20:30", "fim": "21:45"},
    {"palco": "Perry's by FIAT", "artista": "Kygo", "inicio": "22:15", "fim": "23:30"}
  ],
  "Sábado - 21 Mar": [
    {"palco": "Budweiser", "artista": "Jadsa", "inicio": "12:45", "fim": "13:40"},
    {"palco": "Budweiser", "artista": "Agnes Nunes", "inicio": "14:45", "fim": "15:45"},
    {"palco": "Budweiser", "artista": "Marina", "inicio": "16:55", "fim": "17:55"},
    {"palco": "Budweiser", "artista": "Lewis Capaldi", "inicio": "19:05", "fim": "20:05"},
    {"palco": "Budweiser", "artista": "Chappell Roan", "inicio": "21:30", "fim": "23:00"},
    {"palco": "Samsung Galaxy", "artista": "Hurricanes", "inicio": "12:00", "fim": "12:45"},
    {"palco": "Samsung Galaxy", "artista": "Varanda", "inicio": "13:40", "fim": "14:40"},
    {"palco": "Samsung Galaxy", "artista": "Foto em Grupo", "inicio": "15:50", "fim": "16:50"},
    {"palco": "Samsung Galaxy", "artista": "Cypress Hill", "inicio": "18:00", "fim": "19:00"},
    {"palco": "Samsung Galaxy", "artista": "Skrillex", "inicio": "20:10", "fim": "21:25"},
    {"palco": "Flying Fish", "artista": "Artur Menezes", "inicio": "12:45", "fim": "13:40"},
    {"palco": "Flying Fish", "artista": "Cidade Dormitório", "inicio": "14:45", "fim": "15:45"},
    {"palco": "Flying Fish", "artista": "The Warning", "inicio": "16:55", "fim": "17:55"},
    {"palco": "Flying Fish", "artista": "TV Girl", "inicio": "19:05", "fim": "20:05"},
    {"palco": "Flying Fish", "artista": "Riize", "inicio": "21:30", "fim": "22:30"},
    {"palco": "Perry's by FIAT", "artista": "Blackat", "inicio": "12:00", "fim": "12:45"},
    {"palco": "Perry's by FIAT", "artista": "Marcelin o Brabo", "inicio": "13:00", "fim": "13:45"},
    {"palco": "Perry's by FIAT", "artista": "Crizin da Z.O.", "inicio": "14:15", "fim": "15:15"},
    {"palco": "Perry's by FIAT", "artista": "Febre90s", "inicio": "15:30", "fim": "16:30"},
    {"palco": "Perry's by FIAT", "artista": "N.I.N.A", "inicio": "16:45", "fim": "17:45"},
    {"palco": "Perry's by FIAT", "artista": "Hamdi", "inicio": "18:00", "fim": "19:00"},
    {"palco": "Perry's by FIAT", "artista": "2Hollis / Rommulas", "inicio": "19:15", "fim": "20:15"},
    {"palco": "Perry's by FIAT", "artista": "Mu540", "inicio": "20:30", "fim": "21:30"},
    {"palco": "Perry's by FIAT", "artista": "Brutalismus 3000", "inicio": "22:00", "fim": "23:30"}
  ],
  "Domingo - 22 Mar": [
    {"palco": "Budweiser", "artista": "Papisa", "inicio": "12:45", "fim": "13:40"},
    {"palco": "Budweiser", "artista": "Mundo Livre S/A", "inicio": "14:45", "fim": "15:45"},
    {"palco": "Budweiser", "artista": "Djo", "inicio": "16:55", "fim": "17:55"},
    {"palco": "Budweiser", "artista": "Turnstile", "inicio": "19:05", "fim": "20:05"},
    {"palco": "Budweiser", "artista": "Tyler, The Creator", "inicio": "21:30", "fim": "22:45"},
    {"palco": "Samsung Galaxy", "artista": "Jonabug", "inicio": "12:00", "fim": "12:45"},
    {"palco": "Samsung Galaxy", "artista": "Nina Maia", "inicio": "13:40", "fim": "14:40"},
    {"palco": "Samsung Galaxy", "artista": "Royel Otis", "inicio": "15:50", "fim": "16:50"},
    {"palco": "Samsung Galaxy", "artista": "Addison Rae", "inicio": "18:00", "fim": "19:00"},
    {"palco": "Samsung Galaxy", "artista": "Lorde", "inicio": "20:10", "fim": "21:25"},
    {"palco": "Flying Fish", "artista": "Papangu", "inicio": "12:45", "fim": "13:40"},
    {"palco": "Flying Fish", "artista": "Oruã", "inicio": "14:45", "fim": "15:45"},
    {"palco": "Flying Fish", "artista": "Balu Brigada", "inicio": "16:55", "fim": "17:55"},
    {"palco": "Flying Fish", "artista": "FBC", "inicio": "19:05", "fim": "20:05"},
    {"palco": "Flying Fish", "artista": "Katseye", "inicio": "21:30", "fim": "22:30"},
    {"palco": "Perry's by FIAT", "artista": "Flávia Durante", "inicio": "12:00", "fim": "12:45"},
    {"palco": "Perry's by FIAT", "artista": "Entropia", "inicio": "13:00", "fim": "13:45"},
    {"palco": "Perry's by FIAT", "artista": "Analu", "inicio": "14:00", "fim": "14:45"},
    {"palco": "Perry's by FIAT", "artista": "Alírio", "inicio": "15:15", "fim": "16:15"},
    {"palco": "Perry's by FIAT", "artista": "Idlibra", "inicio": "16:30", "fim": "17:30"},
    {"palco": "Perry's by FIAT", "artista": "Zopelar", "inicio": "17:45", "fim": "18:45"},
    {"palco": "Perry's by FIAT", "artista": "Rōz", "inicio": "19:00", "fim": "20:00"},
    {"palco": "Perry's by FIAT", "artista": "Yousuke Yukimatsu", "inicio": "20:15", "fim": "21:30"},
    {"palco": "Perry's by FIAT", "artista": "Peggy Gou", "inicio": "21:45", "fim": "23:15"}
  ]
};

const translations = {
  en: {
    configRequired: "Configuration Required",
    configMessage: "To run the app with Supabase, you must configure your API keys in the Secrets panel.",
    secretsStep1: "Open the Secrets panel (padlock icon).",
    secretsStep2: "Add VITE_SUPABASE_URL with your project URL.",
    secretsStep3: "Add VITE_SUPABASE_ANON_KEY with your anon key.",
    autoreload: "After adding, the app will reload automatically.",
    settings: "Settings",
    exportJson: "Export JSON",
    importJson: "Import JSON",
    noMembers: "No members added.",
    viewSelection: "Selection",
    viewAgenda: "My Schedule",
    viewGroup: "Where are they?",
    noShowsSelected: "No shows selected for this day.",
    goToSelection: "Go to selection →",
    conflito: "Conflict",
    overlapText: "Overlap of {gap}min",
    gapText: "{gap}min gap",
    groupTimeline: "Group Timeline",
    timelineTip: "Drag horizontally to see the complete timeline (12h - 00h)",
    showsList: "Show List",
    you: "You",
    members: "Members",
    newMemberPlaceholder: "New member...",
    rename: "Rename",
    delete: "Delete",
    clearSelection: "Clear Selections",
    done: "Done",
    conflictTitle: "Conflict Warning",
    conflictMessage: "You selected shows that happen at the same time!",
    viewAgendaBtn: "View Schedule",
    loggedInAs: "Logged in as",
    markedShows: "Marked Shows",
    showsCount: "{count} shows",
    importSuccess: "Data imported successfully!",
    importError: "Error importing: ",
    importFileError: "Error importing JSON file.",
    palcoText: "Stage",
    stageLabels: {
      "Budweiser": "Budweiser Stage",
      "Samsung Galaxy": "Samsung Stage",
      "Flying Fish": "Flying Fish Stage",
      "Perry's by FIAT": "Perry's Stage"
    }
  },
  pt: {
    configRequired: "Configuração Necessária",
    configMessage: "Para o site funcionar com o Supabase, você precisa configurar as chaves de API no painel de Secrets.",
    secretsStep1: "Abra o painel Secrets (ícone de cadeado).",
    secretsStep2: "Adicione VITE_SUPABASE_URL com a URL do seu projeto.",
    secretsStep3: "Adicione VITE_SUPABASE_ANON_KEY com sua chave anon.",
    autoreload: "Após adicionar, o aplicativo irá recarregar automaticamente.",
    settings: "Configurações",
    exportJson: "Exportar JSON",
    importJson: "Importar JSON",
    noMembers: "Nenhum integrante adicionado.",
    viewSelection: "Seleção",
    viewAgenda: "Minha Agenda",
    viewGroup: "Onde estão?",
    noShowsSelected: "Nenhum show selecionado para este dia.",
    goToSelection: "Ir para seleção →",
    conflito: "Conflito",
    overlapText: "Sobreposição de {gap}min",
    gapText: "{gap}min de intervalo",
    groupTimeline: "Timeline do Grupo",
    timelineTip: "Arraste para o lado para ver o cronograma completo (12h - 00h)",
    showsList: "Lista de Shows",
    you: "Você",
    members: "Integrantes",
    newMemberPlaceholder: "Novo integrante...",
    rename: "Renomear",
    delete: "Excluir",
    clearSelection: "Limpar Seleções",
    done: "Concluir",
    conflictTitle: "Aviso de Conflito",
    conflictMessage: "Você selecionou shows que acontecem ao mesmo tempo!",
    viewAgendaBtn: "Ver Agenda",
    loggedInAs: "Logado como",
    markedShows: "Shows Marcados",
    showsCount: "{count} shows",
    importSuccess: "Dados importados com sucesso!",
    importError: "Erro ao importar: ",
    importFileError: "Erro ao importar arquivo JSON.",
    palcoText: "Palco",
    stageLabels: {
      "Budweiser": "Palco Budweiser",
      "Samsung Galaxy": "Palco Samsung Galaxy",
      "Flying Fish": "Palco Flying Fish",
      "Perry's by FIAT": "Palco Perry's by FIAT"
    }
  }
};

const translateDay = (day: string, lang: 'en' | 'pt') => {
  if (lang === 'pt') return day;
  if (day.startsWith("Sexta")) return "Friday - Mar 20";
  if (day.startsWith("Sábado")) return "Saturday - Mar 21";
  if (day.startsWith("Domingo")) return "Sunday - Mar 22";
  return day;
};

const translatePalco = (palco: string, lang: 'en' | 'pt') => {
  const labels = translations[lang].stageLabels as Record<string, string>;
  return labels[palco] || palco;
};

const DAYS = Object.keys(SCHEDULE);
const PALCOS = Array.from(new Set(Object.values(SCHEDULE).flat().map(s => s.palco)));

// --- Helper Functions ---

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const checkConflict = (show1: Show, show2: Show) => {
  const start1 = timeToMinutes(show1.inicio);
  const end1 = timeToMinutes(show1.fim);
  const start2 = timeToMinutes(show2.inicio);
  const end2 = timeToMinutes(show2.fim);

  return (start1 < end2 && start2 < end1);
};

// --- Main Component ---

export default function App() {
  const [friends, setFriends] = useState<string[]>([]);
  const [currentFriend, setCurrentFriend] = useState("");
  const [currentDay, setCurrentDay] = useState(DAYS[0]);
  const [view, setView] = useState<'selection' | 'agenda' | 'group'>('selection');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newFriendName, setNewFriendName] = useState("");
  const [editingFriend, setEditingFriend] = useState<{old: string, new: string} | null>(null);
  const [selections, setSelections] = useState<Selections>({});
  const [showConflictToast, setShowConflictToast] = useState(false);
  const conflictToastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [lang, setLang] = useState<'en' | 'pt'>(() => {
    const saved = localStorage.getItem('lolla_helper_lang');
    return (saved === 'en' || saved === 'pt') ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('lolla_helper_lang', lang);
  }, [lang]);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      // Fetch Friends
      const { data: friendsData } = await supabase
        .from('amigos')
        .select('nome')
        .order('nome');
      
      const friendsList = (friendsData || []).map(f => f.nome);
      setFriends(friendsList);
      if (friendsList.length > 0) setCurrentFriend(friendsList[0]);

      // Fetch Selections
      const { data: selectionsData } = await supabase
        .from('escolhas')
        .select('*');
      
      const formatted: Selections = {};
      friendsList.forEach(f => {
        formatted[f] = DAYS.reduce((acc, day) => ({ ...acc, [day]: [] }), {});
      });

      (selectionsData || []).forEach(s => {
        if (formatted[s.amigo]) {
          formatted[s.amigo][s.dia].push(s.show_id);
        }
      });
      setSelections(formatted);
    };

    fetchData();

    // Supabase Realtime Subscriptions
    const friendsChannel = supabase.channel('amigos_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'amigos' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setFriends(prev => [...prev, payload.new.nome].sort());
          setSelections(prev => ({
            ...prev,
            [payload.new.nome]: DAYS.reduce((acc, day) => ({ ...acc, [day]: [] }), {})
          }));
        } else if (payload.eventType === 'DELETE') {
          const deletedName = payload.old.nome;
          setFriends(prev => prev.filter(f => f !== deletedName));
          setSelections(prev => {
            const { [deletedName]: _, ...rest } = prev;
            return rest;
          });
        }
      })
      .subscribe();

    const selectionsChannel = supabase.channel('escolhas_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'escolhas' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setSelections(prev => {
            const currentDaySelections = prev[payload.new.amigo]?.[payload.new.dia] || [];
            if (currentDaySelections.includes(payload.new.show_id)) return prev;
            return {
              ...prev,
              [payload.new.amigo]: {
                ...(prev[payload.new.amigo] || {}),
                [payload.new.dia]: [...currentDaySelections, payload.new.show_id]
              }
            };
          });
        } else if (payload.eventType === 'DELETE') {
          setSelections(prev => {
            const currentDaySelections = prev[payload.old.amigo]?.[payload.old.dia] || [];
            return {
              ...prev,
              [payload.old.amigo]: {
                ...(prev[payload.old.amigo] || {}),
                [payload.old.dia]: currentDaySelections.filter(id => id !== payload.old.show_id)
              }
            };
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(friendsChannel);
      supabase.removeChannel(selectionsChannel);
    };
  }, []);

  // Ensure currentFriend is valid if friends list changes
  useEffect(() => {
    if (friends.length > 0 && !friends.includes(currentFriend)) {
      setCurrentFriend(friends[0]);
    } else if (friends.length === 0) {
      setCurrentFriend("");
    }
  }, [friends, currentFriend]);

  const addFriend = async () => {
    if (!newFriendName.trim() || friends.includes(newFriendName.trim())) return;
    const name = newFriendName.trim();
    await supabase.from('amigos').insert([{ nome: name }]);
    setNewFriendName("");
  };

  const removeFriend = async (name: string) => {
    if (!confirm(lang === 'en' ? `Are you sure you want to remove ${name}?` : `Tem certeza que deseja remover ${name}?`)) return;
    await supabase.from('amigos').delete().eq('nome', name);
  };

  const renameFriend = async () => {
    if (!editingFriend || !editingFriend.new.trim() || friends.includes(editingFriend.new.trim())) return;
    const { old, new: newName } = editingFriend;
    await supabase.from('amigos').update({ nome: newName.trim() }).eq('nome', old);
    setEditingFriend(null);
  };

  const clearFriendSelections = async (name: string) => {
    if (!confirm(lang === 'en' ? `Do you want to clear all selected shows for ${name}?` : `Deseja limpar todos os shows selecionados para ${name}?`)) return;
    await supabase.from('escolhas').delete().eq('amigo', name);
  };

  const triggerConflictToast = () => {
    if (conflictToastTimer.current) clearTimeout(conflictToastTimer.current);
    setShowConflictToast(true);
    conflictToastTimer.current = setTimeout(() => setShowConflictToast(false), 4000);
  };

  const toggleShow = async (artistName: string) => {
    const currentDaySelections = selections[currentFriend]?.[currentDay] || [];
    const isSelected = currentDaySelections.includes(artistName);

    if (isSelected) {
      await supabase
        .from('escolhas')
        .delete()
        .eq('amigo', currentFriend)
        .eq('dia', currentDay)
        .eq('show_id', artistName);
    } else {
      await supabase
        .from('escolhas')
        .insert([{ amigo: currentFriend, dia: currentDay, show_id: artistName }]);

      // Check if adding this show creates a conflict
      const newShow = SCHEDULE[currentDay].find(s => s.artista === artistName);
      if (newShow) {
        const otherSelected = SCHEDULE[currentDay].filter(
          s => currentDaySelections.includes(s.artista) && s.artista !== artistName
        );
        const hasConflict = otherSelected.some(s => checkConflict(s, newShow));
        if (hasConflict) triggerConflictToast();
      }
    }
  };

  const currentConflicts = useMemo(() => {
    const selectedArtists = selections[currentFriend]?.[currentDay] || [];
    const selectedShows = SCHEDULE[currentDay].filter(s => selectedArtists.includes(s.artista));
    const conflicts: string[] = [];

    for (let i = 0; i < selectedShows.length; i++) {
      for (let j = i + 1; j < selectedShows.length; j++) {
        if (checkConflict(selectedShows[i], selectedShows[j])) {
          conflicts.push(selectedShows[i].artista, selectedShows[j].artista);
        }
      }
    }
    return Array.from(new Set(conflicts));
  }, [selections, currentFriend, currentDay]);

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selections));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "lolla_group_2026.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setSelections(json);
        alert(translations[lang].importSuccess);
      } catch (err) {
        alert(translations[lang].importFileError);
      }
    };
    reader.readAsText(file);
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-6 font-sans text-white">
        <div className="max-w-md w-full bg-[#2a2a2a] rounded-3xl p-8 shadow-2xl border border-white/10 text-center">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">{translations[lang].configRequired}</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            {translations[lang].configMessage}
          </p>
          
          <div className="space-y-4 text-left bg-black/20 p-4 rounded-2xl border border-white/5 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold mt-0.5">1</div>
              <p className="text-sm text-gray-300">{translations[lang].secretsStep1}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold mt-0.5">2</div>
              <p className="text-sm text-gray-700">{translations[lang].secretsStep2}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold mt-0.5">3</div>
              <p className="text-sm text-gray-700">{translations[lang].secretsStep3}</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 italic">
            {translations[lang].autoreload}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-sans selection:bg-cyan-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/favicon_logo.png" 
                alt="Lollapalooza Helper Logo" 
                className="w-10 h-10 rounded-xl shadow-lg shadow-violet-900/20"
              />
              <div>
                <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                  Lollapalooza <span className="text-rose-400">Helper</span>
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <button 
                onClick={() => setLang(lang === 'en' ? 'pt' : 'en')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all text-xs font-bold font-mono cursor-pointer"
                title={lang === 'en' ? "Switch to Portuguese" : "Mudar para Inglês"}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'EN' : 'PT'}</span>
              </button>
              
              <button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60 hover:text-white" title={translations[lang].settings}>
                <Settings className="w-5 h-5" />
              </button>
              <button onClick={exportData} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60 hover:text-white" title={translations[lang].exportJson}>
                <Download className="w-5 h-5" />
              </button>
              <label className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60 hover:text-white cursor-pointer" title={translations[lang].importJson}>
                <Upload className="w-5 h-5" />
                <input type="file" accept=".json" onChange={importData} className="hidden" />
              </label>
            </div>
          </div>

          {/* Friend Switcher */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {friends.map(friend => (
              <button
                key={friend}
                onClick={() => setCurrentFriend(friend)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 border ${
                  currentFriend === friend 
                    ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/40 scale-105' 
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                {friend}
              </button>
            ))}
            {friends.length === 0 && (
              <p className="text-xs text-white/40 py-2">{translations[lang].noMembers}</p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 pb-24">
        {/* Navigation Tabs */}
        <div className="flex flex-col gap-6 mb-8">
          {/* Day Selector */}
          <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setCurrentDay(day)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  currentDay === day 
                    ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-900/20' 
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {translateDay(day, lang).split(' - ')[0]}
                <span className="block text-[10px] opacity-60 font-medium">{translateDay(day, lang).split(' - ')[1]}</span>
              </button>
            ))}
          </div>

          {/* View Selector */}
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => setView('selection')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === 'selection' ? 'text-rose-400 bg-rose-400/10' : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Calendar className="w-4 h-4" /> {translations[lang].viewSelection}
            </button>
            <button 
              onClick={() => setView('agenda')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === 'agenda' ? 'text-cyan-400 bg-cyan-400/10' : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Clock className="w-4 h-4" /> {translations[lang].viewAgenda}
            </button>
            <button 
              onClick={() => setView('group')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === 'group' ? 'text-violet-400 bg-violet-400/10' : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Users className="w-4 h-4" /> {translations[lang].viewGroup}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${view}-${currentDay}-${currentFriend}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'selection' && (
              <div className="space-y-8">
                {PALCOS.map(palco => {
                  const showsInPalco = SCHEDULE[currentDay].filter(s => s.palco === palco);
                  if (showsInPalco.length === 0) return null;
                  
                  return (
                     <section key={palco} className="space-y-3">
                      <div className="flex items-center gap-2 px-1">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <h2 className="text-xs font-black uppercase tracking-widest text-white/40">{translatePalco(palco, lang)}</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {showsInPalco.map(show => {
                          const isSelected = selections[currentFriend]?.[currentDay]?.includes(show.artista);
                          const hasConflict = currentConflicts.includes(show.artista);
                          
                          return (
                            <button
                              key={show.artista}
                              onClick={() => toggleShow(show.artista)}
                              className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 text-left ${
                                isSelected 
                                  ? 'bg-white/10 border-cyan-500/50 shadow-inner' 
                                  : 'bg-white/5 border-white/5 hover:border-white/20'
                              }`}
                            >
                              <div className="flex flex-col gap-1">
                                <span className={`text-[10px] font-bold uppercase tracking-tighter ${isSelected ? 'text-cyan-400' : 'text-white/30'}`}>
                                  {show.inicio} — {show.fim}
                                </span>
                                <h3 className={`text-lg font-bold leading-tight ${isSelected ? 'text-white' : 'text-white/70'}`}>
                                  {show.artista}
                                </h3>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                {hasConflict && isSelected && (
                                  <motion.div 
                                    initial={{ scale: 0 }} 
                                    animate={{ scale: 1 }} 
                                    className="p-2 bg-rose-500/20 rounded-full"
                                  >
                                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                                  </motion.div>
                                )}
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  isSelected 
                                    ? 'bg-cyan-500 border-cyan-500' 
                                    : 'border-white/10 group-hover:border-white/30'
                                }`}>
                                  {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}

            {view === 'agenda' && (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-2xl font-black">
                      {currentFriend[0]}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{currentFriend}</h2>
                      <p className="text-white/40 text-sm">{translateDay(currentDay, lang)}</p>
                    </div>
                  </div>

                  {selections[currentFriend]?.[currentDay]?.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                        <Calendar className="w-8 h-8 text-white/20" />
                      </div>
                      <p className="text-white/40 font-medium">{translations[lang].noShowsSelected}</p>
                      <button 
                        onClick={() => setView('selection')}
                        className="text-cyan-400 text-sm font-bold hover:underline"
                      >
                        {translations[lang].goToSelection}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {SCHEDULE[currentDay]
                        .filter(s => selections[currentFriend]?.[currentDay]?.includes(s.artista))
                        .sort((a, b) => timeToMinutes(a.inicio) - timeToMinutes(b.inicio))
                        .map((show, idx, arr) => {
                          const hasConflict = currentConflicts.includes(show.artista);
                          const nextShow = arr[idx + 1];
                          const timeGap = nextShow ? timeToMinutes(nextShow.inicio) - timeToMinutes(show.fim) : null;
                          
                          return (
                            <div key={show.artista} className="relative">
                              <div className={`p-5 rounded-2xl border flex items-center justify-between ${
                                hasConflict ? 'bg-rose-500/10 border-rose-500/30' : 'bg-white/5 border-white/10'
                              }`}>
                                <div className="flex gap-4 items-center">
                                  <div className="text-center min-w-[60px]">
                                    <span className="block text-xs font-bold text-cyan-400">{show.inicio}</span>
                                    <span className="block text-[10px] text-white/30 uppercase font-black">{show.fim}</span>
                                  </div>
                                  <div className="w-px h-8 bg-white/10" />
                                  <div>
                                    <h4 className="font-bold text-lg">{show.artista}</h4>
                                    <p className="text-xs text-white/40 flex items-center gap-1">
                                      <MapPin className="w-3 h-3" /> {translatePalco(show.palco, lang)}
                                    </p>
                                  </div>
                                </div>
                                {hasConflict && (
                                  <div className="flex items-center gap-2 text-rose-500 text-[10px] font-bold uppercase bg-rose-500/10 px-3 py-1 rounded-full">
                                    <AlertTriangle className="w-3 h-3" /> {translations[lang].conflito}
                                  </div>
                                )}
                              </div>
                              
                              {nextShow && (
                                <div className="ml-12 py-2 flex items-center gap-2">
                                  <div className="w-0.5 h-4 bg-white/5" />
                                  <span className={`text-[10px] font-bold uppercase tracking-widest ${timeGap && timeGap < 0 ? 'text-rose-400' : 'text-white/20'}`}>
                                    {timeGap && timeGap < 0 
                                      ? translations[lang].overlapText.replace('{gap}', String(Math.abs(timeGap))) 
                                      : translations[lang].gapText.replace('{gap}', String(timeGap))}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {view === 'group' && (
              <div className="space-y-8">
                {/* Timeline Visualization */}
                <div className="space-y-4">
                  <h2 className="text-lg font-bold flex items-center gap-2 px-2">
                    <Calendar className="w-5 h-5 text-cyan-400" /> {translations[lang].groupTimeline}
                  </h2>
                  
                  <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto no-scrollbar">
                      <div className="min-w-[800px] p-6">
                        {/* Time Markers */}
                        <div className="flex items-start gap-4 mb-4 border-b border-white/10">
                          <div className="w-20 flex-shrink-0"></div>
                          <div className="relative flex-1 h-6">
                            {Array.from({ length: 13 }).map((_, i) => {
                              const hour = 12 + i;
                              const displayHour = hour > 23 ? hour - 24 : hour;
                              const left = (i * 60 / 720) * 100;
                              return (
                                <div key={i} className="absolute top-0 -translate-x-1/2" style={{ left: `${left}%` }}>
                                  <span className="text-[10px] font-bold text-white/30">{displayHour}:00</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Friend Rows */}
                        <div className="space-y-3">
                          {friends.map(friend => (
                            <div key={friend} className="flex items-center gap-4">
                              <div className="w-20 flex-shrink-0">
                                <span className={`text-xs font-bold truncate block ${friend === currentFriend ? 'text-cyan-400' : 'text-white/60'}`}>
                                  {friend}
                                </span>
                              </div>
                              <div className="flex-1 h-8 bg-white/5 rounded-lg relative overflow-hidden">
                                {SCHEDULE[currentDay]
                                  .filter(s => selections[friend]?.[currentDay]?.includes(s.artista))
                                  .map(show => {
                                    const start = timeToMinutes(show.inicio);
                                    const end = timeToMinutes(show.fim);
                                    const left = ((start - 720) / 720) * 100;
                                    const width = ((end - start) / 720) * 100;
                                    
                                    return (
                                      <div
                                        key={show.artista}
                                        className="absolute top-1 bottom-1 rounded-md bg-gradient-to-r from-cyan-500 to-violet-600 border border-white/20 shadow-sm flex items-center px-2 overflow-hidden"
                                        style={{ left: `${left}%`, width: `${width}%` }}
                                        title={`${show.artista} (${show.inicio} - ${show.fim})`}
                                      >
                                        <span className="text-[8px] font-black uppercase tracking-tighter truncate text-white">
                                          {show.artista}
                                        </span>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/5 px-6 py-3 border-t border-white/10 flex items-center gap-2">
                      <Info className="w-3 h-3 text-white/30" />
                      <p className="text-[10px] text-white/30 font-medium">{translations[lang].timelineTip}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Users className="w-5 h-5 text-violet-400" /> {translations[lang].showsList}
                    </h2>
                    <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold uppercase">
                      <div className="w-2 h-2 rounded-full bg-cyan-500" /> {translations[lang].you}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {SCHEDULE[currentDay]
                      .sort((a, b) => timeToMinutes(a.inicio) - timeToMinutes(b.inicio))
                      .map(show => {
                        const friendsHere = friends.filter(f => selections[f]?.[currentDay]?.includes(show.artista));
                        if (friendsHere.length === 0) return null;

                        const isYouHere = friendsHere.includes(currentFriend);

                        return (
                          <div 
                            key={show.artista} 
                            className={`p-5 rounded-3xl border transition-all ${
                              isYouHere ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/5 border-white/10'
                            }`}
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white/40">{show.inicio} — {show.fim}</span>
                                  <span className="px-2 py-0.5 bg-white/5 rounded text-[9px] font-black uppercase tracking-widest text-white/30">{translatePalco(show.palco, lang)}</span>
                                </div>
                                <h3 className="text-xl font-black tracking-tight">{show.artista}</h3>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {friendsHere.map(friend => (
                                  <div 
                                    key={friend}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                                      friend === currentFriend 
                                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-900/40' 
                                        : 'bg-white/10 text-white/70'
                                    }`}
                                  >
                                    <UserCircle2 className="w-3.5 h-3.5" />
                                    {friend}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#222] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-violet-400" /> {translations[lang].members}
                </h2>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar">
                {/* Add Friend */}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newFriendName}
                    onChange={(e) => setNewFriendName(e.target.value)}
                    placeholder={translations[lang].newMemberPlaceholder}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <button 
                    onClick={addFriend}
                    className="bg-cyan-500 hover:bg-cyan-600 p-2 rounded-xl transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Friends List */}
                <div className="space-y-3">
                  {friends.map(friend => (
                    <div key={friend} className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
                      {editingFriend?.old === friend ? (
                        <div className="flex-1 flex gap-2">
                          <input 
                            type="text" 
                            value={editingFriend.new}
                            onChange={(e) => setEditingFriend({ ...editingFriend, new: e.target.value })}
                            className="flex-1 bg-white/10 border border-cyan-500 rounded-lg px-3 py-1 text-sm focus:outline-none"
                            autoFocus
                          />
                          <button onClick={renameFriend} className="text-cyan-400 p-1">
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button onClick={() => setEditingFriend(null)} className="text-white/40 p-1">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-bold text-sm">{friend}</span>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => clearFriendSelections(friend)}
                              className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-amber-400 transition-colors"
                              title={translations[lang].clearSelection}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setEditingFriend({ old: friend, new: friend })}
                              className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-cyan-400 transition-colors"
                              title={translations[lang].rename}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => removeFriend(friend)}
                              className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-rose-500 transition-colors"
                              title={translations[lang].delete}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-white/5 border-t border-white/10">
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-2xl font-bold text-sm transition-colors"
                >
                  {translations[lang].done}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Conflict Toast */}
      <AnimatePresence>
        {showConflictToast && (
          <motion.div 
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 left-4 right-4 z-50 pointer-events-none"
          >
            <div className="max-w-md mx-auto bg-rose-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 pointer-events-auto">
              <div className="bg-white/20 p-2 rounded-xl flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-widest opacity-80">{translations[lang].conflictTitle}</p>
                <p className="text-sm font-bold leading-tight">{translations[lang].conflictMessage}</p>
              </div>
              <button 
                onClick={() => { setView('agenda'); setShowConflictToast(false); }}
                className="bg-white text-rose-500 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-white/90 transition-colors flex-shrink-0"
              >
                {translations[lang].viewAgendaBtn}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav Spacer */}
      <div className="h-20" />
      
      {/* Mobile-friendly Info Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a]/90 backdrop-blur-xl border-t border-white/10 p-4 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Users className="w-5 h-5 text-white/40" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{translations[lang].loggedInAs}</p>
              <p className="text-sm font-bold text-white">{currentFriend}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{translations[lang].markedShows}</p>
            <p className="text-sm font-bold text-cyan-400">
              {translations[lang].showsCount.replace('{count}', String(selections[currentFriend]?.[currentDay]?.length || 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
