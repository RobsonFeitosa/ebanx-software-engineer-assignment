import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './shared/infra/database/database.module';
import { TrainersModule } from './modules/trainers/trainers.module';
import { PokemonsModule } from './modules/pokemons/pokemons.module';
import { TeamsModule } from './modules/teams/teams.module';
import { MessageBrokerModule } from './shared/infra/http/providers/message-broker-provider/message-broker.module';

import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ScheduleModule.forRoot(),
        DatabaseModule,
        TrainersModule,
        PokemonsModule,
        TeamsModule,
        MessageBrokerModule.register()
    ],
})
export class AppModule { }