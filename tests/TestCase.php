<?php

namespace Eklundlabs\InertiaDatatable\Tests;

use Eklundlabs\InertiaDatatable\InertiaDatatableProvider;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Orchestra\Testbench\TestCase as Orchestra;

class TestCase extends Orchestra
{
    protected function setUp(): void
    {
        parent::setUp();

        Factory::guessFactoryNamesUsing(
            fn (string $modelName) => 'Eklundlabs\\InertiaDatatable\\Database\\Factories\\'.class_basename($modelName).'Factory'
        );
    }

    protected function getPackageProviders($app)
    {
        return [
            InertiaDatatableProvider::class,
        ];
    }

    public function getEnvironmentSetUp($app)
    {
        // Sets random app.key during testing for the
        // table actions signing to work properly
        config()->set('app.key', Str::random(32));

        config()->set('database.default', 'testing');

        Schema::dropAllTables();

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });

        //         foreach (\Illuminate\Support\Facades\File::allFiles(__DIR__ . '/../database/migrations') as $migration) {
        //            (include $migration->getRealPath())->up();
        //         }
    }
}
