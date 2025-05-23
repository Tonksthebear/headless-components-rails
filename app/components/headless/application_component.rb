# frozen_string_literal: true

module Headless
  class ApplicationComponent < ViewComponent::Base
    include Classy::Yaml::ComponentHelpers
    renders_many :icons, ->(icon_name = nil, icon: icon_name, variant: "micro", **icon_options) do
      heroicon icon, variant: variant, data: { slot: "icon" }, **icon_options
    end

    attr_reader :as

    def self.jsx_mapping(file: nil, component: nil)
      @jsx_mapping ||= { view_component: self.name, file: file, component: component }
    end

    def initialize(**options)
      @options = options
      @options.deep_merge!({ data: { disabled: "" } }) if @options[:disabled]
      super(**options)
    end

    def merge_classes!(classes, extra: "")
      @options[:class] = class_names(@options[:class], classes)
      @options[:class] = @options[:class!] if @options[:class!]
      @options[:class] = class_names(@options[:class], extra)
    end

    def merge_options!(options)
      @options.deep_merge!(options) do |key, old_value, new_value|
        case old_value
        when Hash
          old_value.merge(new_value)
        when String
          class_names(old_value, new_value)
        else
          new_value
        end
      end

      @options[:data][:autofocus] = "" if @options[:autofocus]
    end
  end
end
