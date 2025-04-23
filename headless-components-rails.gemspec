require_relative "lib/headless/version"

Gem::Specification.new do |spec|
  spec.name        = "headless-components-rails"
  spec.version     = Headless::VERSION
  spec.authors     = [ "Tonksthebear" ]
  spec.homepage    = "TODO"
  spec.summary     = "TODO: Summary of HeadlessComponentsRails."
  spec.description = "TODO: Description of HeadlessRails."
  spec.license     = "MIT"

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the "allowed_push_host"
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  spec.metadata["allowed_push_host"] = "TODO: Set to 'http://mygemserver.com'"

  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = "TODO: Put your gem's public repo URL here."
  spec.metadata["changelog_uri"] = "TODO: Put your gem's CHANGELOG.md URL here."

  spec.files = Dir.chdir(File.expand_path(__dir__)) do
    Dir["{app,config,db,lib,vendor}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]
  end

  spec.add_dependency "rails", ">= 7"
  spec.add_dependency "view_component"
  spec.add_dependency "mini_racer"
  spec.add_dependency "rails_heroicon"
  spec.add_dependency "classy-yaml", ">= 1.4"
  spec.add_dependency "stimulus-rails"
  spec.add_dependency "turbo-rails"
  spec.add_dependency "importmap-rails"
  spec.add_development_dependency "lookbook", ">= 2.3.8"
end
