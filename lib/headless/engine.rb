module Headless
  class Engine < ::Rails::Engine
    require "classy/yaml"
    require "rails_heroicon"

    config.to_prepare do
      Classy::Yaml.setup do |config|
        config.engine_files << Engine.root.join("config/headless.yml")
        config.extra_files << Rails.root.join("config/headless.yml")
      end
    end

    initializer "headless.assets" do
      Rails.application.config.assets.precompile += %w[headless/manifest.js]
    end

    initializer "headless.importmap", before: "importmap" do |app|
      app.config.importmap.paths << Engine.root.join("config/importmap.rb")
      app.config.importmap.cache_sweepers << Engine.root.join("app/javascript")
    end

    initializer "headless.importmap.assets" do
      Rails.application.config.assets.paths << Engine.root.join("app/javascript")
    end
  end
end
