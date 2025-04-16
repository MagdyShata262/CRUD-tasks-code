import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';

const routes: Routes = [
  {path:'',
  redirectTo: 'login',
  pathMatch: 'full'
  },
  {path:'tasks',
  loadChildren: () => import(`./tasks-admin/tasks-admin.module`).then(m => m.TasksAdminModule),
  canActivate: [AuthGuard]
  },
  {path:'users',
  loadChildren: () => import(`./manage-users/manage-users.module`).then(m => m.ManageUsersModule),
  canActivate: [AuthGuard]
  },
  {path:'login',
  loadChildren: () => import(`./auth/auth.module`).then(m => m.AuthModule)
  },
  // Catch-all route for any unmatched routes
  {path:'**', redirectTo: 'login'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes ,  { useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
