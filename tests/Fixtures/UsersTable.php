<?php

namespace Eklundlabs\InertiaDatatable\Tests\Fixtures;

use Eklundlabs\InertiaDatatable\Action;
use Eklundlabs\InertiaDatatable\Columns\TextColumn;
use Eklundlabs\InertiaDatatable\Table;

class UsersTable extends Table
{
    protected ?string $resource = \Eklundlabs\InertiaDatatable\Tests\Models\User::class;

    public function columns(): array
    {
        return [
            TextColumn::make('name', 'Name')
                ->searchable(),
            TextColumn::make('email', 'Email')
                ->searchable(),
        ];
    }

    public function actions(): array
    {
        return [
            Action::make('Delete', fn (User $user) => $user->delete())
                ->requireConfirmation('Are you sure?'),
            Action::make('Archive', fn (User $user) => $user->update(['archived' => true])),
        ];
    }
}
