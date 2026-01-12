<?php

use Eklundlabs\InertiaDatatable\InertiajsDatatableOptions;
use Eklundlabs\InertiaDatatable\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/data-tables/{table}/action/{action}', function (Request $request, string $table, string $action) {
    if (! app()->make(InertiajsDatatableOptions::class)->actionsIsEnabled()) {
        throw new Exception('Inertia datatables actions disabled');
    }

    /** @var class-string<Table> $class */
    $class = base64_decode($table);

    /** @var Table $tableInstance */
    $tableInstance = app($class);

    $actionToExecute = $tableInstance->getAction($action);

    if (! $actionToExecute) {
        abort(404, 'Action not found');
    }

    $tableInstance->executeAction($actionToExecute, $request->get('keys', []));

    return back();
});
