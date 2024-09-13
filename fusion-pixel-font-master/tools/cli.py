import shutil

from cyclopts import App
from loguru import logger

from tools import configs
from tools.configs import path_define, FontSize, WidthMode, FontFormat, FontCollectionFormat
from tools.configs.dump import DumpConfig
from tools.configs.fallback import FallbackConfig
from tools.configs.font import FontConfig
from tools.services import update_service, dump_service, publish_service, info_service, template_service, image_service
from tools.services.font_service import DesignContext

app = App(version=configs.version)


@app.default
def main(
        cleanup: bool = False,
        font_sizes: list[FontSize] | None = None,
        width_modes: list[WidthMode] | None = None,
        font_formats: list[FontFormat | FontCollectionFormat] | None = None,
        all_attachments: bool = False,
        release: bool = False,
        font_info: bool = False,
        html: bool = False,
        image: bool = False,
):
    if font_sizes is None:
        font_sizes = configs.font_sizes
    if width_modes is None:
        width_modes = configs.width_modes
    if font_formats is None:
        font_formats = configs.font_formats + configs.font_collection_formats
    if all_attachments:
        release = True
        font_info = True
        html = True
        image = True

    all_font_sizes = set(font_sizes) == set(configs.font_sizes)

    print()
    print(f'cleanup = {cleanup}')
    print(f'font_sizes = {repr(font_sizes)}')
    print(f'width_modes = {repr(width_modes)}')
    print(f'font_formats = {repr(font_formats)}')
    print(f'release = {release}')
    print(f'font_info = {font_info}')
    print(f'html = {html}')
    print(f'image = {image}')
    print()

    if cleanup and path_define.build_dir.exists():
        shutil.rmtree(path_define.build_dir)
        logger.info("Delete dir: '{}'", path_define.build_dir)

    update_service.setup_ark_pixel_glyphs()

    dump_configs = DumpConfig.load()
    fallback_configs = FallbackConfig.load()
    font_configs = {}
    design_contexts = {}
    for font_size in font_sizes:
        for dump_config in dump_configs[font_size]:
            dump_service.dump_font(dump_config)

        for fallback_config in fallback_configs[font_size]:
            dump_service.apply_fallback(fallback_config)

        font_config = FontConfig.load(font_size)
        font_configs[font_size] = font_config
        design_context = DesignContext.load(font_config)
        design_contexts[font_size] = design_context
        for width_mode in width_modes:
            for font_format in font_formats:
                design_context.make_fonts(width_mode, font_format)

    if release:
        for font_size in font_sizes:
            for width_mode in width_modes:
                for font_format in font_formats:
                    publish_service.make_release_zip(font_size, width_mode, font_format)

    if font_info:
        for font_size in font_sizes:
            design_context = design_contexts[font_size]
            for width_mode in width_modes:
                info_service.make_font_info(design_context, width_mode)

    if html:
        for font_size in font_sizes:
            design_context = design_contexts[font_size]
            for width_mode in width_modes:
                template_service.make_alphabet_html(design_context, width_mode)
            template_service.make_demo_html(design_context)
        if all_font_sizes:
            template_service.make_index_html(font_configs)
            template_service.make_playground_html(font_configs)

    if image:
        for font_size in font_sizes:
            font_config = font_configs[font_size]
            image_service.make_preview_image(font_config)


if __name__ == '__main__':
    app()
