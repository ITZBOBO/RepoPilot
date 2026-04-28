import React from 'react';
import { 
  Brain, Building2, Package, TrendingUp, BarChart, ArrowUpCircle, 
  UserCircle, Search, FileText, Tag, Moon, Zap, Leaf, Flame, 
  CheckCircle2, Sunrise, Sunset, Rocket, Folder, LogOut, Trophy, 
  CircleDollarSign, Lightbulb, ClipboardList, Palette, Calendar, 
  RefreshCw, Trash2, Home, Book, Target, Map, HelpCircle, Wrench, 
  Sparkles, PartyPopper, Users, Mail, Mailbox, GraduationCap, 
  Laptop, Briefcase, Building, Globe, CalendarDays, CalendarIcon, 
  Circle, FileCode, FolderOpen, Puzzle, Bot, Lock, CreditCard, 
  Utensils, Film, PieChart, Smartphone, Gamepad2, BookOpen, MapPin, 
  Image, Bug, Eye, Settings, Star, Edit3, Link2, Square, Save, Keyboard
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  '🧠': Brain,
  '🏗️': Building2,
  '🏗': Building2,
  '📦': Package,
  '📈': TrendingUp,
  '📊': BarChart,
  '🔝': ArrowUpCircle,
  '🦸': UserCircle,
  '📝': FileText,
  '🔗': Link2, 
  '🍞': Package,
  '📑': FileText,
  '👤': UserCircle,
  '🔍': Search,
  '📄': FileText,
  '🏷': Tag,
  '🌙': Moon,
  '⚡': Zap,
  '🌱': Leaf,
  '🔥': Flame,
  '✅': CheckCircle2,
  '🌅': Sunrise,
  '🌆': Sunset,
  '🚀': Rocket,
  '📁': Folder,
  '🚪': LogOut,
  '🏆': Trophy,
  '💰': CircleDollarSign,
  '💡': Lightbulb,
  '📋': ClipboardList,
  '🎨': Palette,
  '📅': Calendar,
  '🔄': RefreshCw,
  '🗑': Trash2,
  '🏠': Home,
  '📚': Book,
  '🎯': Target,
  '🗺': Map,
  '🤔': HelpCircle,
  '🛠': Wrench,
  '✨': Sparkles,
  '🎉': PartyPopper,
  '👥': Users,
  '📨': Mail,
  '📭': Mailbox,
  '🎓': GraduationCap,
  '💻': Laptop,
  '💼': Briefcase,
  '🏢': Building,
  '🌍': Globe,
  '🗓': CalendarDays,
  '📆': CalendarIcon,
  '🟢': Circle,
  '🐍': FileCode,
  '📂': FolderOpen,
  '🧩': Puzzle,
  '🤖': Bot,
  '🔒': Lock,
  '💳': CreditCard,
  '🍽': Utensils,
  '🎬': Film,
  '🥧': PieChart,
  '📱': Smartphone,
  '🎮': Gamepad2,
  '📖': BookOpen,
  '📍': MapPin,
  '🖼': Image,
  '🐛': Bug,
  '👀': Eye,
  '⚙️': Settings,
  '⚙': Settings,
  '⭐': Star,
  '✍️': Edit3,
  '✍': Edit3,
  '⬛': Square,
  '💾': Save,
  '⌨': Keyboard
};

interface EmojiIconProps {
  emoji: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function EmojiIcon({ emoji, size = 18, className = '', style }: EmojiIconProps) {
  if (!emoji) return null;
  const cleanEmoji = emoji.replace(/[\ufe0f]/g, '');
  const Icon = iconMap[emoji] || iconMap[cleanEmoji];
  
  if (Icon) {
    return <Icon size={size} className={className} style={style} />;
  }
  return <span className={className} style={{...style, fontSize: size}}>{emoji}</span>;
}
