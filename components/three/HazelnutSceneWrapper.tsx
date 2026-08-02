"use client";
import { Component, type ReactNode } from "react";

interface State { hasError: boolean; }

export class ThreeErrorBoundary extends Component<{ children: ReactNode }, State> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: Error) { console.warn("[Three.js]", err.message); }
  render() {
    if (this.state.hasError) return null; // silently fail
    return this.props.children;
  }
}
