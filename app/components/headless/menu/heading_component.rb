module Headless
  module Menu
    class HeadingComponent < ApplicationComponent
      attr_reader :id

      def initialize(id:, **options)
        @id = id
        super(**options)
      end

      before_render do
        merge_classes!(yass(headless: { menu: { heading: :classes } }))
        merge_options!({ id: @id, role: "presentation" })
      end

      def call
        content_tag(:header, content, **options)
      end
    end
  end
end 