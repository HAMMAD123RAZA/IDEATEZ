// client/src/components/ThreeErrorBoundary.jsx

import { Component } from 'react';
export default class ThreeErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('3D Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div className="text-white p-4">3D content failed to load</div>;
    }
    return this.props.children;
  }
}