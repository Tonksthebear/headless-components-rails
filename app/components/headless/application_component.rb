# frozen_string_literal: true

module Headless
  class ApplicationComponent < ViewComponent::Base
    include Classy::Yaml::ComponentHelpers

    def self.jsx_mapping(file: nil, component: nil)
      @jsx_mapping ||= { view_component: self.name, file: file, component: component }
    end
  end
end
