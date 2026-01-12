> [!NOTE]
> Limitations
> - Currently only react is supported
> - Only one table per page

## Prerequisites

- Tailwind CSS v4 or higher
- Laravel v12 or higher
- Inertiajs v2.1 or higher using react

## Installation

### 1. Install the Composer package

```bash
composer require eklundlabs/inertiajs-datatables:dev-main
```

### 2. Install the NPM package
```bash
npm install vendor/eklundlabs/inertiajs-datatables/react
```

### 3. Register package paths with Tailwind
Add the package paths using the `@source` directive in your `app.css` file:
```css
@source '../../vendor/eklundlabs/inertiajs-datatables/react/**/*.{ts,tsx}';
```

## Your first datatable

### 1. Define your datatable
```php
use App\Models\User;
use Eklundlabs\InertiaDatatable\Table;
use Eklundlabs\InertiaDatatable\Actions\Action;
use Eklundlabs\InertiaDatatable\Columns\TextColumn;

class Users extends Table
{
    protected ?string $resource = User::class;

    public function columns(): array
    {
        return [
            TextColumn::make('name', 'Namn')
                ->searchable()
                ->url(fn(User $user) => route('users.show', $user->id)),
            TextColumn::make('email', 'Email'),
        ];
    }

    public function actions(): array
    {
        return [
            Action::make('Delete', fn (User $user) => $user->delete())
                ->confirm('Are you sure you want to delete this user?'),
        ];
    }
}
```

### 2. Expose the datatable via the Inertia response
```php
use Inertia\Inertia;
use App\DataTables\Users;

class UsersController extends Controller
{
    public function __invoke(Request $request)
    {
        return Inertia::render('users/listing', [
            'users' => Users::make()
        ]);
    }
}
```

### 3. Render it using the `DataTable` react component
```tsx
import { usePage } from '@inertiajs/react';
import { DataTable, type DataTableResource } from '@eklundlabs/inertia-datatable-react';

export default function UsersListing() {
    const { props } = usePage<{
        users: DataTableResource;
    }>();

    return (<DataTable resource={props.users} />);
}
```
