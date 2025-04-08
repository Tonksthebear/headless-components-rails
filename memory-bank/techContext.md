# Technical Context: Headless

## Technologies Used
1. **Core Technologies**
   - Ruby
   - Rails (>= 8.0.2)
   - ViewComponent

2. **Development Tools**
   - Bundler
   - Rake
   - RubyGems

3. **Testing Framework**
   - Rails Test Framework
   - Lookbook (>= 2.3.8)

## Development Setup
1. **Prerequisites**
   - Ruby (compatible with Rails 8.0.2)
   - Bundler
   - Git

2. **Installation**
   ```bash
   git clone [repository-url]
   cd headless
   bundle install
   ```

3. **Development Dependencies**
   - classy-yaml
   - lookbook
   - rubocop

## Technical Constraints
1. **Rails Version**
   - Minimum: 8.0.2
   - Must maintain compatibility

2. **Ruby Version**
   - Must be compatible with Rails 8.0.2
   - Follow Ruby version support lifecycle

3. **ViewComponent Integration**
   - Must maintain compatibility with ViewComponent
   - Follow ViewComponent best practices

## Dependencies
1. **Runtime Dependencies**
   - rails (>= 8.0.2)
   - view_component

2. **Development Dependencies**
   - classy-yaml
   - lookbook (>= 2.3.8)

## Build and Test
1. **Build Process**
   ```bash
   bundle install
   rake build
   ```

2. **Testing**
   ```bash
   rake test
   ```

3. **Development Server**
   ```bash
   bin/dev
   ```

## Deployment
1. **RubyGems**
   - Configure allowed_push_host
   - Set up proper metadata
   - Follow gem publishing guidelines

2. **Documentation**
   - Maintain up-to-date README
   - Include usage examples
   - Document API changes

## Styling System

### Yass Helper
The `yass` helper is a custom helper that provides a structured way to access component-specific styles defined in YAML files. It's particularly useful for ViewComponents as it:

1. Maintains component-specific styles in dedicated YAML files
2. Provides a consistent interface for accessing styles
3. Supports nested component inheritance
4. Uses nested hash syntax to represent YAML hierarchy

Usage pattern:
```erb
<%# Basic access %>
<%= yass(component: :style) %>

<%# Nested access %>
<%= yass(component: { parent: { child: :style } }) %>
```

The helper maps directly to YAML structure:
```yaml
component:
  style: "value"
  parent:
    child:
      style: "value"
``` 