<?php

use Eklundlabs\InertiaDatatable\Tests\Fixtures\UsersTable;
use Eklundlabs\InertiaDatatable\Tests\Models\User;

beforeEach(function () {
    /** @var $user User */
    $this->users = User::factory()->count(5)->create();

    $this->table = UsersTable::make();
});

it('sets table name as base64 value', function () {
    expect($this->table['table'])->toBe(base64_encode(UsersTable::class));
});

it('table response returns correct keys', function () {
    expect($this->table)
        ->toHaveKeys($response = ['table', 'rows', 'columns', 'actions', 'perPageOptions', 'searchQuery', 'data'])
        ->toHaveCount(count($response));
});
