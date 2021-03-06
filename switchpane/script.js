if (window.Addon == 1) {
	Addons.SwitchPane =
	{
		NextFV: function (Ctrl)
		{
			var cTC = te.Ctrls(CTRL_TC, true);
			var TC = te.Ctrl(CTRL_TC);
			var nId = TC.Id;
			var nLen = cTC.length;
			var ix = [];
			for (var i = nLen; i--;) {
				ix.push(i);
			}
			ix = ix.sort(
				function (a, b) {
					var rca = api.Memory("RECT");
					var rcb = api.Memory("RECT");
					api.GetWindowRect(cTC[a].hwnd, rca);
					api.GetWindowRect(cTC[b].hwnd, rcb);
					if (rca.Top > rcb.Top) {
						return 1;
					} else if (rca.Top < rcb.Top) {
						return -1;
					}
					return rca.Left - rcb.Left;
				}
			);
			for (var i = nLen; i--;) {
				if (cTC[ix[i]].Id == nId) {
					nId = i;
					break;
				}
			}
			return cTC[ix[(nId + 1) % nLen]].Selected;
		}
	},

	AddEnv("Other", function(Ctrl)
	{
		var FV = Addons.SwitchPane.NextFV(Ctrl);
		if (FV) {
			return api.PathQuoteSpaces(api.GetDisplayNameOf(FV, SHGDN_FORPARSING));
		}
	});

	AddTypeEx("Add-ons", "Switch to next pane", function (Ctrl)
	{
		var FV = Addons.SwitchPane.NextFV(Ctrl);
		if (FV) {
			return FV.Focus();
		}
	});
}
