﻿if (window.Addon == 1) {

	Addons.QuickMenu =
	{
		Items: null,
		SendTo: function (hMenu)
		{
			hMenu = api.sscanf(hMenu, "%llx");
			Addons.QuickMenu.Items = sha.NameSpace(ssfSENDTO).Items();
			for (var i = 0; i < Addons.QuickMenu.Items.Count; i++) {
				api.InsertMenu(hMenu, MAXINT, MF_BYPOSITION | MF_STRING, 0x7100 + i, api.GetDisplayNameOf(Addons.QuickMenu.Items.Item(i), SHGDN_INFOLDER));
			}
			AddEvent("MenuCommand", function (Ctrl, pt, Name, nVerb)
			{
				nVerb -= 0x7100;
				if (nVerb >= 0 && nVerb < Addons.QuickMenu.Items.Count) {
					var DropTarget = api.DropTarget(Addons.QuickMenu.Items.Item(nVerb));
					pdwEffect = api.Memory("DWORD");
					pdwEffect[0] = DROPEFFECT_COPY | DROPEFFECT_MOVE | DROPEFFECT_LINK;
					var Selected = Ctrl.SelectedItems();
					if (Selected) {
						DropTarget.Drop(Selected, MK_LBUTTON, pt, pdwEffect);
					}
					return S_OK;
				}
			});
		}
	}

	AddEvent("GetBaseMenu", function (nBase, FV, Selected, uCMF, Mode, SelItem)
	{
		if (Mode & 0x8000) {
			return;
		}
		var hMenu;
		var nPos = 0;
		var wID = 0x7000;
		var ContextMenu = null;
		switch (nBase) {
			case 2:
				var Items = Selected;
				if (!Items || !Items.Count) {
					Items = SelItem;
				}
				ContextMenu = api.ContextMenu(Items, FV);
				if (ContextMenu) {
					hMenu = api.CreatePopupMenu();
					ContextMenu.QueryContextMenu(hMenu, 0, 0x1001, 0x6FFF, CMF_DEFAULTONLY | CMF_CANRENAME);
					if (!FV) {
						SetRenameMenu(0x1001);
					}
					var mii = api.Memory("MENUITEMINFO");
					mii.cbSize = mii.Size;
					mii.fMask  = MIIM_FTYPE;
					while (api.GetMenuItemInfo(hMenu, nPos++, true, mii) && !(mii.fType & MFT_SEPARATOR)) {
					}
					var hModule = api.GetModuleHandle(fso.BuildPath(system32, "shell32.dll"));
					var hMenu1 = api.LoadMenu(hModule, 223);
					var hMenu2 = api.GetSubMenu(hMenu1, 0);
					mii.fMask  = MIIM_ID | MIIM_STRING | MIIM_SUBMENU;
					mii.wID = wID++;
					mii.dwTypeData = api.GetMenuString(hMenu2, 0, MF_BYPOSITION);
					mii.hSubMenu = api.CreatePopupMenu();
					api.InsertMenu(mii.hSubMenu, 0, MF_BYPOSITION | MF_STRING, 0, api.sprintf(99, '\tJScript\tAddons.QuickMenu.SendTo("%llx")', mii.hSubMenu));
					api.InsertMenuItem(hMenu, nPos++, true, mii);
					api.InsertMenu(hMenu, nPos++, MF_BYPOSITION | MF_SEPARATOR, 0, null);
					api.DestroyMenu(hMenu2);
					api.DestroyMenu(hMenu1);
				}
				ExtraMenuCommand[wID] = function (Ctrl, pt, Name, nVerb)
				{
					ExecMenu(Ctrl, Name, pt, 0x8000);
				};
				api.InsertMenu(hMenu, 1, MF_BYPOSITION | MF_STRING, wID++, GetText("Default"));

				return [hMenu, ContextMenu];
			case 3:
				hMenu = api.CreatePopupMenu();
				if (FV) {
					ContextMenu = FV.ViewMenu();
					if (ContextMenu) {
						ContextMenu.QueryContextMenu(hMenu, 0, 0x1001, 0x6FFF, CMF_DEFAULTONLY);
						ExtraMenuCommand[wID] = function (Ctrl, pt, Name, nVerb)
						{
							ExecMenu(Ctrl, Name, pt, 0x8000);
						};
						api.InsertMenu(hMenu, 0, MF_BYPOSITION | MF_STRING, wID++, GetText("Default"));
					}
				}
				return [hMenu, ContextMenu];
			case 4:
				var Items = Selected;
				if (!FV && (!Items || !Items.Count)) {
					Items = SelItem;
				}

				if (Items && Items.Count) {
					ContextMenu = api.ContextMenu(Items, FV);
					if (ContextMenu) {
						hMenu = api.CreatePopupMenu();
						ContextMenu.QueryContextMenu(hMenu, 0, 0x1001, 0x6FFF, CMF_DEFAULTONLY | CMF_CANRENAME);
						if (!FV) {
							SetRenameMenu(0x1001);
						}
					}
				}
				else if (FV) {
					hMenu = api.CreatePopupMenu();
					ContextMenu = FV.ViewMenu();
					if (ContextMenu) {
						ContextMenu.QueryContextMenu(hMenu, 0, 0x1001, 0x6FFF, CMF_DEFAULTONLY);
						var mii = api.Memory("MENUITEMINFO");
						mii.cbSize = mii.Size;
						mii.fMask = MIIM_FTYPE | MIIM_SUBMENU;
						for (var i = api.GetMenuItemCount(hMenu); i--;) {
							api.GetMenuItemInfo(hMenu, 0, true, mii);
							if (mii.hSubMenu || (mii.fType & MFT_SEPARATOR)) {
								api.DeleteMenu(hMenu, 0, MF_BYPOSITION);
								continue;
							}
							break;
						}
					}
				}
				ExtraMenuCommand[wID] = function (Ctrl, pt, Name, nVerb)
				{
					ExecMenu(Ctrl, Name, pt, 0x8000);
				};
				api.InsertMenu(hMenu, 0, MF_BYPOSITION | MF_STRING, wID++, GetText("Default"));
				return [hMenu, ContextMenu];
		}
	});
}
