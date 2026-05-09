import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto, UpdateInventoryItemDto } from './dto/inventory.dto';

@ApiTags('Inventory')
@ApiBearerAuth('bearer')
@Controller('inventory')
export class InventoryController {
  constructor(private service: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'List inventory items' })
  findAll(){ return this.service.findAll(); }

  @Get('low-stock')
  @ApiOperation({ summary: 'List items below or equal to reorder level' })
  lowStock(){ return this.service.lowStock(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory item by ID' })
  @ApiParam({ name: 'id', example: 'inventory-item-uuid' })
  findOne(@Param('id') id:string){ return this.service.findOne(id); }

  @Roles(Role.ADMIN, Role.STORE_KEEPER)
  @Post()
  @ApiOperation({ summary: 'Create inventory item - Admin or Store Keeper' })
  @ApiBody({ type: CreateInventoryItemDto })
  create(@Body() body: CreateInventoryItemDto){ return this.service.create(body); }

  @Roles(Role.ADMIN, Role.STORE_KEEPER)
  @Patch(':id')
  @ApiOperation({ summary: 'Update inventory item or stock level' })
  @ApiParam({ name: 'id', example: 'inventory-item-uuid' })
  @ApiBody({ type: UpdateInventoryItemDto })
  update(@Param('id') id:string, @Body() body: UpdateInventoryItemDto){ return this.service.update(id, body); }
}
