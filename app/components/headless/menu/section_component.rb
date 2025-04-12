module Headless
  module Menu
    class SectionComponent < ApplicationComponent
      attr_reader :labelledby

      def initialize(aria: { labelledby: }, **options)
        @labelledby = labelledby
        super(**options)
      end

      before_render do
        merge_classes!(yass(headless: { menu: { section: :classes } }))
        merge_options!({ role: "group", aria: { labelledby: @labelledby } })
      end
    end
  end
end