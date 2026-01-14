<?php

use Eklundlabs\InertiaDatatable\InertiajsDatatableOptions;
use Eklundlabs\InertiaDatatable\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/data-tables/{table}/action/{action}', function (Request $request, string $table, string $action) {
    $expectedSignature = hash_hmac(
        'sha256',
        $table.'|'.$action,
        config('app.key')
    );

    abort_unless(hash_equals($expectedSignature, $request->query('signature')), 401);

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

    $response = $tableInstance->executeAction($actionToExecute, $request->get('keys', []));

    return $actionToExecute->isLink ? $response : back();
})->name('inertiajs-datatables.actions');
