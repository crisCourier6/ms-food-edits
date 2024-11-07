import { MainController } from "./controller/MainController"
import { UserEditsFoodController } from "./controller/UserEditsFoodController"

export const Routes = [{
    method: "get",
    route: "/api/v1/submissions",
    controller: MainController,
    action: "userEditsFoodAll"
}, 
{
    method: "get",
    route: "/api/v1/submissions/:id",
    controller: MainController,
    action: "userEditsFoodOne"
}, 
{
    method: "post",
    route: "/api/v1/submissions/:id",
    controller: MainController,
    action: "userEditsFoodUpdate"
},
{
    method: "post",
    route: "/api/v1/submissions/:id/evaluate",
    controller: MainController,
    action: "userEditsFoodUpdate"
},
{
    method: "post",
    route: "/api/v1/submissions-images",
    controller: UserEditsFoodController,
    action: "uploadImage"
},
{
    method: "post",
    route: "/api/v1/submissions",
    controller: UserEditsFoodController,
    action: "save"
}, 
{
    method: "delete",
    route: "/api/v1/submissions/:id",
    controller: MainController,
    action: "userEditsFoodRemove"
},
// food local
{
    method: "get",
    route: "/api/v1/submissions-food",
    controller: MainController,
    action: "foodLocalAll"
}, 
{
    method: "get",
    route: "/api/v1/submissions-food/:id",
    controller: MainController,
    action: "foodLocalOne"
}, 
// additives
{
    method: "get",
    route: "/api/v1/submissions-additives/",
    controller: MainController,
    action: "additiveAll"
}, 
{
    method: "post",
    route: "/api/v1/submissions-additives/",
    controller: MainController,
    action: "additiveSave"
}, 
{
    method: "get",
    route: "/api/v1/submissions-additives/:id",
    controller: MainController,
    action: "additiveOne"
}, 
{
    method: "post",
    route: "/api/v1/submissions-additives/:id",
    controller: MainController,
    action: "additiveUpdate"
}, 
{
    method: "delete",
    route: "/api/v1/submissions-additives/:id",
    controller: MainController,
    action: "additiveRemove"
}, 
// allergen
{
    method: "get",
    route: "/api/v1/submissions-allergens/",
    controller: MainController,
    action: "allergenAll"
}, 
{
    method: "post",
    route: "/api/v1/submissions-allergens/",
    controller: MainController,
    action: "allergenSave"
}, 
{
    method: "get",
    route: "/api/v1/submissions-allergens/:id",
    controller: MainController,
    action: "allergenOne"
}, 
{
    method: "delete",
    route: "/api/v1/submissions-allergens/:id",
    controller: MainController,
    action: "allergenRemove"
},
]