import {Body, Delete, Get, Param, Patch, Post} from '@nestjs/common';
import AbstractEntity from "../model/AbstractEntity";
import AbstractDTO from "../payload/AbstractDTO";
import AbstractCrudService from "../service/AbstractCrudService";

export default abstract class AbstractController<
    T extends AbstractEntity,
    D extends AbstractDTO,
> {
    protected abstract getService(): AbstractCrudService<T, D>;

    @Post()
    create(@Body() dto: D) {
        return this.getService().create(dto);
    }

    @Get()
    findAll() {
        return this.getService().findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.getService().findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: D) {
        return this.getService().update(+id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.getService().remove(+id);
    }
}
