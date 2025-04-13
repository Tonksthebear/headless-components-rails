module Headless
  module Menu
    class SectionComponent < ApplicationComponent
      attr_reader :name

      renders_one :heading, -> (**options) do
        options[:id] = @name
        Headless::Menu::HeadingComponent.new(**options)
      end

      def initialize(name: self.object_id, **options)
        @name = name
        super(**options)
      end

      def before_render
        merge_classes!(yass(headless: { menu: { section: :classes } }))
        merge_options!({ role: "group", aria: { labelledby: @name } })
      end

      def call
        tag.div(**options) do
          content
        end
      end
    end
  end
end