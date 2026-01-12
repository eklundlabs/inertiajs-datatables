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
            ->name('inertiajs-datatables');
    }
}
