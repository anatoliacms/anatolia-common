import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Filter } from 'src/payload/Filter';
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
    findAll(@Query() query:string) {
        return this.getService().findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.getService().findOne(+id);
    }

    @Post('filter')
    filter(@Body() filter: Filter) {
        return this.getService().filter(filter);
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
