# frozen_string_literal: true

class HeadlessViewComponent::InstallGenerator < Rails::Generators::Base
  source_root File.expand_path("templates", __dir__)

  def copy_files
    template "config/headless_view_component.yml"
  end
end
