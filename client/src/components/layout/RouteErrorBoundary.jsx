import { Component } from 'react';

/**
 * Safety net for the lazy-loaded route area. If a page fails to load or render
 * (e.g. a chunk that survived the auto-reload retry), show a friendly recovery
 * screen instead of a blank page.
 */
export default class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, prevKey: props.resetKey };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  // Clear the error when the route changes so one bad page doesn't latch the
  // boundary across navigations (it lives above the route, so it isn't remounted).
  static getDerivedStateFromProps(props, state) {
    if (props.resetKey !== state.prevKey) {
      return { hasError: false, prevKey: props.resetKey };
    }
    return null;
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.error('Route failed to load:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="grid min-h-[70vh] place-items-center px-6 text-center">
        <div className="max-w-md">
          <h1 className="font-display text-3xl text-ink-900">This page didn’t load</h1>
          <p className="mt-3 text-ink-500">
            The site may have just been updated. Reloading usually fixes it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex h-12 items-center rounded-full bg-brand-500 px-7 font-semibold text-white transition-colors hover:bg-brand-600"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
