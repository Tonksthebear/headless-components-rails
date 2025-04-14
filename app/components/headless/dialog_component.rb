module Headless
  class DialogComponent < ApplicationComponent
    renders_one :panel, Headless::Dialog::PanelComponent
    renders_one :backdrop, Headless::Dialog::BackdropComponent
    renders_one :title, Headless::Dialog::TitleComponent
    renders_one :description, Headless::DescriptionComponent

    DEFAULT_TAG = :div
    DEFAULT_ROLE = :dialog

    attr_reader :open, :role

    def initialize(open: false, as: DEFAULT_TAG, role: DEFAULT_ROLE, **options)
      @open = open
      @as = as
      @role = role
      super(**options)
    end

    def before_render
      merge_options!({
        id: @options[:id],
        tabindex: "-1",
        role: @role,
        aria: {
          modal: true
        },
        data: {
          controller: "headless--dialog",
        }
      })
    end

    def call
      tag.public_send(@as, **@options) do
        content
      end
    end
  end
end