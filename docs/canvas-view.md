# Canvas View Documentation

## Overview

The Canvas View is the central workspace in ScriptMan where users visually organize and manage their game script timeline. This interactive canvas replaces traditional spreadsheets with an intuitive, time-based interface that mirrors how events actually unfold during a game.

## Core Features

### Display Modes
- **Horizontal Mode**: Events flow left-to-right in a Gantt-chart style view
- **Vertical Mode**: Events flow top-to-bottom in a traditional running order format

### Time Management
- **Flexible Intervals**: Choose from 15s, 30s, 1min, 5min, 15min, 30min, or 60min increments
- **Dynamic Zoom**: Zoom in for detailed work (down to 15-second precision) or out for overview planning
- **Time Display**: Shows real clock time (e.g., "6:55 PM") with clear markers

### Element Management
- **Add Elements**: Click directly on the timeline or use the Add Event button
- **Element Library**: Drag pre-configured elements from the sidebar library
- **Edit In-Place**: Click any element to modify its properties
- **Visual Organization**: Color-coded elements based on type for easy scanning

### Navigation
- **Pan & Zoom**: Navigate through the timeline with intuitive controls
- **Time Markers**: Clear indicators show time progression
- **Status Display**: Current zoom level and interval are always visible

## User Interaction

### Adding Elements
1. **Direct Timeline Click**: Click anywhere on the canvas to add an event at that specific time
2. **Add Event Button**: Use the button in the control panel
3. **Drag from Library**: Drag pre-configured elements from the Elements Library sidebar

### Editing Elements
- **Click to Edit**: Select any element to open its edit dialog
- **Drag to Reposition**: Move elements to different times
- **Resize**: Adjust duration by dragging element edges (coming soon)
- **Delete**: Remove elements via the edit dialog

### Canvas Controls
- **Orientation Toggle**: Switch between horizontal and vertical views
- **Interval Selector**: Choose time increment granularity
- **Zoom Controls**: Zoom in/out to adjust detail level
- **Export Options**: Generate PDF or print layouts

## Elements Library

The Elements Library sidebar provides quick access to:

- **Sponsor Reads**: Pre-configured sponsor messages
- **Permanent Markers**: Standard game events (Halftime, Pre-Game Countdown, etc.)
- **Promotions**: Marketing and promotional activities
- **Generic Events**: Common occurrences like weather updates

## Sponsor Management

The Sponsor Management section allows users to:
- Track sponsor fulfillment across games
- Manage sponsor assets and requirements
- Monitor sponsor read frequency and placement

## Export Options

- **Print Layout**: Generate a printer-friendly version of the script
- **Export PDF**: Create a shareable PDF document of the entire timeline

## Technical Implementation

The Canvas View uses HTML5 Canvas for rendering the timeline, providing:
- High-performance rendering of complex timelines
- Pixel-perfect control over element positioning
- Smooth zooming and panning capabilities
- Responsive design that adapts to different screen sizes

## Best Practices

- Use appropriate zoom levels based on script density
- Leverage the Elements Library for consistency across games
- Maintain a logical flow of events with appropriate spacing
- Regularly export or save your work
- Use color-coding consistently to aid visual scanning

