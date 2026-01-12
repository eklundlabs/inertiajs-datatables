<?php

declare(strict_types=1);

namespace Eklundlabs\InertiaDatatable;

use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

class InertiaDatatableProvider extends PackageServiceProvider
{
    public function configurePackage(Package $package): void
    {
        $package
            ->name('inertiajs-datatables')
            ->hasRoutes('inertiajs-datatables-routes');
    }

    public function register(): void
    {
        parent::register();

        $this->app->bind(InertiajsDatatableOptions::class, function () {
            return new InertiajsDatatableOptions;
        });
    }
}
