import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, CheckCircle, Zap, Shield, Layout, PenTool, BookOpen } from 'lucide-angular';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  readonly CheckCircle = CheckCircle;
  readonly Zap = Zap;
  readonly Shield = Shield;
  readonly Layout = Layout;
  readonly PenTool = PenTool;
  readonly BookOpen = BookOpen;

  features = [
    {
      title: 'Structured Workspaces',
      description: 'Organize your notes, ideas, and projects into beautiful, dedicated workspaces.',
      icon: Layout,
      color: '#7C3AED'
    },
    {
      title: 'Digital Diaries',
      description: 'Capture your daily thoughts and reflections with a built-in personal journaling experience.',
      icon: BookOpen,
      color: '#2563EB'
    },
    {
      title: 'Interactive Stories',
      description: 'Draft your next masterpiece or long-form content with our intuitive story editor.',
      icon: PenTool,
      color: '#DB2777'
    },
    {
      title: 'Bank-Grade Security',
      description: 'Protect your sensitive information with workstation-level PIN locking for individual items.',
      icon: Shield,
      color: '#059669'
    },
    {
      title: 'Lightning Performance',
      description: 'Experience a smooth, instant-response interface optimized for focus and speed.',
      icon: Zap,
      color: '#D97706'
    },
    {
      title: 'Always with You',
      description: 'Your notes and thoughts are always available across all your modern web devices.',
      icon: CheckCircle,
      color: '#7C5CFF'
    }
  ];
}
