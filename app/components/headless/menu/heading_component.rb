module Headless
  module Menu
    class HeadingComponent < ApplicationComponent
      attr_reader :id

      def initialize(id:, **options)
        @id = id
        super(**options)
      end

      def before_render
        merge_classes!(yass(headless: { menu: { heading: :classes } }))
        merge_options!({ id: @id, role: "presentation" })
      end

      def call
        content_tag(:header, content, **options)
      end
    end
  end
end
